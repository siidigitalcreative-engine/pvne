import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readVillageData, writeVillageData } from "@/lib/blob-store";
import type { Business } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (value: unknown, max = 160) =>
  typeof value === "string" ? value.trim().replace(/\\s+/g, " ").slice(0, max) : "";

function addressKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in to view your business listings." }, { status: 401 });
    const data = await readVillageData();
    const blockLot = `Block ${user.blockNumber ?? ""}, Lot ${user.lotNumber ?? ""}`;
    const businesses = data.businesses.filter((business) =>
      business.ownerId === user.id ||
      (!business.ownerId && addressKey(business.blockLot) === addressKey(`Block ${user.blockNumber ?? ""} Lot ${user.lotNumber ?? ""}`))
    );
    return NextResponse.json({ businesses, blockNumber: user.blockNumber ?? "", lotNumber: user.lotNumber ?? "" }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    console.error("PVNE my-business GET failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load business listings." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in to manage a business listing." }, { status: 401 });
    if (!user.blockNumber || !user.lotNumber) return NextResponse.json({ error: "Save your Block and Lot in My House before adding a business." }, { status: 400 });
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const name = clean(body.name, 100);
    const category = clean(body.category, 80);
    const description = clean(body.description, 1200);
    const hours = clean(body.hours, 120);
    const emoji = clean(body.emoji, 8) || "🏪";
    const locationType = body.locationType;
    const status = body.status;
    if (name.length < 2 || !category || description.length < 5 || !hours) {
      return NextResponse.json({ error: "Enter a business name, category, description, and business hours." }, { status: 400 });
    }
    if (locationType !== "Inside Store" && locationType !== "Inside PVNE") {
      return NextResponse.json(
        { error: "Choose where the business is located: Inside Store or Inside PVNE." },
        { status: 400 },
      );
    }\n    if (!["Open", "Hours vary", "Closed"].includes(String(status))) {
      return NextResponse.json({ error: "Choose a valid business status." }, { status: 400 });
    }

    const data = await readVillageData();
    const requestedId = clean(body.id, 100);
    let saved: Business;
    if (requestedId) {
      const index = data.businesses.findIndex((b) => b.id === requestedId && b.ownerId === user.id);
      if (index < 0) return NextResponse.json({ error: "You can only edit listings you own." }, { status: 403 });
      saved = { ...data.businesses[index], name, category, description, hours, emoji, locationType, status: status as Business["status"], blockLot: `Block ${user.blockNumber}, Lot ${user.lotNumber}`, ownerId: user.id };
      data.businesses[index] = saved;
    } else {
      saved = {
        id: `biz-${crypto.randomUUID()}`, ownerId: user.id, name, category, description, hours, emoji, locationType,
        status: status as Business["status"], blockLot: `Block ${user.blockNumber}, Lot ${user.lotNumber}`,
      };
      data.businesses.unshift(saved);
    }
    await writeVillageData(data);
    return NextResponse.json({ ok: true, business: saved }, { status: requestedId ? 200 : 201, headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    console.error("PVNE my-business POST failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save this business." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in to manage a business listing." }, { status: 401 });
    const id = clean(request.nextUrl.searchParams.get("id"), 100);
    if (!id) return NextResponse.json({ error: "Business ID is required." }, { status: 400 });
    const data = await readVillageData();
    const index = data.businesses.findIndex((b) => b.id === id && b.ownerId === user.id);
    if (index < 0) return NextResponse.json({ error: "You can only remove listings you own." }, { status: 403 });
    const [removed] = data.businesses.splice(index, 1);
    await writeVillageData(data);
    return NextResponse.json({ ok: true, id: removed.id }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    console.error("PVNE my-business DELETE failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not remove this business." }, { status: 503 });
  }
}
