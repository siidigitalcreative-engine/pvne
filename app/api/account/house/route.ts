import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readUsers, writeUsers } from "@/lib/user-store";

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
        streetName: current.streetName ?? "",
        ownerRelationship: current.ownerRelationship ?? "",
        ownerRelationshipOther: current.ownerRelationshipOther ?? "",
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
    const streetName = clean(body.streetName, 100);
    const ownerRelationship = clean(body.ownerRelationship, 40);
    const ownerRelationshipOther = clean(body.ownerRelationshipOther, 100);
    if (!blockNumber || !lotNumber) return NextResponse.json({ error: "Block and Lot are required." }, { status: 400 });
    if (!relationships.has(ownerRelationship)) return NextResponse.json({ error: "Select your relationship to the Homeowner." }, { status: 400 });
    if (ownerRelationship === "other" && !ownerRelationshipOther) return NextResponse.json({ error: "Please specify your relationship." }, { status: 400 });

    const users = await readUsers();
    const target = users.find((user) => user.id === current.id);
    if (!target || target.status !== "active") return NextResponse.json({ error: "Your account could not be found." }, { status: 404 });
    target.blockNumber = blockNumber;
    target.lotNumber = lotNumber;
    target.streetName = streetName;
    target.ownerRelationship = ownerRelationship;
    target.ownerRelationshipOther = ownerRelationship === "other" ? ownerRelationshipOther : "";
    await writeUsers(users);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PVNE house update failed:", error);
    return NextResponse.json({ error: "Could not save your house details. Please try again." }, { status: 503 });
  }
}
