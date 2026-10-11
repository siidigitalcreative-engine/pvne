import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readVillageData, writeVillageData, type VillageData } from "@/lib/blob-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.status !== "active") return NextResponse.json({ error: "Please log in to view village content." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const data = await readVillageData();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load village data." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    let data: VillageData;
    try { data = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
    if (!data || !Array.isArray(data.households) || !Array.isArray(data.businesses) || !Array.isArray(data.posts)) return NextResponse.json({ error: "Expected households, businesses, and posts arrays." }, { status: 400 });
    if (JSON.stringify(data).length > 1_500_000) return NextResponse.json({ error: "Data payload is too large." }, { status: 413 });
    await writeVillageData(data);
    return NextResponse.json({ ok: true, message: "Village data saved to Vercel Blob." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save data." }, { status: 500 });
  }
}
