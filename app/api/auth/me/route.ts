import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { publicUser } from "@/lib/user-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user: user ? publicUser(user) : null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not check session." }, { status: 503 });
  }
}
