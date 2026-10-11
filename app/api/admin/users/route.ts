import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { publicUser, readUsers, writeUsers, type UserRole } from "@/lib/user-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current || current.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    const users = await readUsers();
    return NextResponse.json({ users: users.map(publicUser) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load members." }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const current = await getCurrentUser();
    if (!current || current.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    const body = await request.json().catch(() => null) as { userId?: unknown; role?: unknown; status?: unknown } | null;
    const userId = typeof body?.userId === "string" ? body.userId : "";
    const role = body?.role;
    const status = body?.status;
    if (!userId || (role !== undefined && role !== "admin" && role !== "member") || (status !== undefined && status !== "active" && status !== "disabled")) {
      return NextResponse.json({ error: "Invalid member update." }, { status: 400 });
    }
    const users = await readUsers();
    const target = users.find((user) => user.id === userId);
    if (!target) return NextResponse.json({ error: "Member not found." }, { status: 404 });
    if (target.id === current.id && (role === "member" || status === "disabled")) {
      return NextResponse.json({ error: "You cannot remove your own Admin access or disable your own account." }, { status: 400 });
    }
    if (role !== undefined) target.role = role as UserRole;
    if (status !== undefined) target.status = status;
    await writeUsers(users);
    return NextResponse.json({ ok: true, user: publicUser(target) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update member." }, { status: 503 });
  }
}
