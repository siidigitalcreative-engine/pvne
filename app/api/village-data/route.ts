import { NextRequest, NextResponse } from "next/server";
import { readVillageData, writeVillageData, type VillageData } from "@/lib/blob-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.VILLAGE_ADMIN_KEY;
  return Boolean(secret && request.headers.get("x-village-admin-key") && request.headers.get("x-village-admin-key") === secret);
}

export async function GET() {
  const data = await readVillageData();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized. Admin key required." }, { status: 401 });
  let data: VillageData;
  try { data = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (!data || !Array.isArray(data.households) || !Array.isArray(data.businesses) || !Array.isArray(data.posts)) {
    return NextResponse.json({ error: "Expected households, businesses, and posts arrays." }, { status: 400 });
  }
  if (JSON.stringify(data).length > 1_500_000) return NextResponse.json({ error: "Data payload is too large." }, { status: 413 });
  try {
    await writeVillageData(data);
    return NextResponse.json({ ok: true, message: "Village data saved to Vercel Blob." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save data." }, { status: 500 });
  }
}
