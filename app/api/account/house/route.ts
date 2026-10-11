import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readUsers, writeUsers } from "@/lib/user-store";
import { readVillageData, writeVillageData } from "@/lib/blob-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const relationships = new Set(["owner", "co_owner", "spouse", "domestic_partner", "family_member", "authorized_representative", "tenant", "other"]);
const clean = (value: unknown, max = 80) => typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
const normalizePart = (value: string) => value.trim().replace(/^0+(?=\d)/, "").toLowerCase();

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Please log in to view your house." }, { status: 401 });
    const users = await readUsers();
    const currentBlock = current.blockNumber ?? "";
    const currentLot = current.lotNumber ?? "";
    const household = currentBlock && currentLot
      ? users.filter((user) => user.status === "active" &&
          normalizePart(user.blockNumber ?? "") === normalizePart(currentBlock) &&
          normalizePart(user.lotNumber ?? "") === normalizePart(currentLot))
          .map((user) => ({
            id: user.id, name: user.name,
            ownerRelationship: user.ownerRelationship ?? "",
            ownerRelationshipOther: user.ownerRelationshipOther ?? "",
          }))
      : [];
    return NextResponse.json({
      house: {
        blockNumber: current.blockNumber ?? "",
        lotNumber: current.lotNumber ?? "",
        ownerRelationship: current.ownerRelationship ?? "",
        ownerRelationshipOther: current.ownerRelationshipOther ?? "",
        colorScheme: current.colorScheme ?? "Turquoise",
      },
      household,
    }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    console.error("PVNE house details failed:", error);
    return NextResponse.json({ error: "Could not load your household details." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Please log in to update your house details." }, { status: 401 });
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    const blockNumber = clean(body.blockNumber, 20);
    const lotNumber = clean(body.lotNumber, 20);
    const ownerRelationship = clean(body.ownerRelationship, 40);
    const ownerRelationshipOther = clean(body.ownerRelationshipOther, 100);
    const colorScheme = clean(body.colorScheme, 20);
    const allowedColors = new Set(["Turquoise", "Aubergine", "Santan"]);
    if (!blockNumber || !lotNumber) return NextResponse.json({ error: "Block and Lot are required." }, { status: 400 });
    if (!relationships.has(ownerRelationship)) return NextResponse.json({ error: "Select your relationship to the Homeowner." }, { status: 400 });
    if (!allowedColors.has(colorScheme)) return NextResponse.json({ error: "Select a valid house color." }, { status: 400 });
    if (ownerRelationship === "other" && !ownerRelationshipOther) return NextResponse.json({ error: "Please specify your relationship." }, { status: 400 });

    const users = await readUsers();
    const target = users.find((user) => user.id === current.id);
    if (!target || target.status !== "active") return NextResponse.json({ error: "Your account could not be found." }, { status: 404 });
    target.blockNumber = blockNumber;
    target.lotNumber = lotNumber;
    target.ownerRelationship = ownerRelationship;
    target.ownerRelationshipOther = ownerRelationship === "other" ? ownerRelationshipOther : "";
    target.colorScheme = colorScheme as "Turquoise" | "Aubergine" | "Santan";
    await writeUsers(users);

    const villageData = await readVillageData();
    const normalize = (value: string) => value.trim().replace(/^0+(?=\\d)/, "").toLowerCase();
    const householdIndex = villageData.households.findIndex((item) =>
      normalize(item.block) === normalize(blockNumber) &&
      normalize(item.lot) === normalize(lotNumber)
    );
    if (householdIndex >= 0) {
      villageData.households[householdIndex] = {
        ...villageData.households[householdIndex],
        colorScheme: colorScheme as "Turquoise" | "Aubergine" | "Santan",
      };
    } else {
      villageData.households.push({
        id: `house-${blockNumber.trim()}-${lotNumber.trim()}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
        block: blockNumber,
        lot: lotNumber,
        street: "",
        colorScheme: colorScheme as "Turquoise" | "Aubergine" | "Santan",
        hasBusiness: false,
        businesses: [],
      });
    }
    await writeVillageData(villageData);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PVNE house update failed:", error);
    return NextResponse.json({ error: "Could not save your house details. Please try again." }, { status: 503 });
  }
}
