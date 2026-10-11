import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { readUsers, writeUsers, publicUser } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Please log in to view your profile." }, { status: 401 });
    return NextResponse.json({ user: publicUser(current) }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "Could not load your profile." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Please log in to update your profile." }, { status: 401 });

    const body = await request.json().catch(() => null) as {
      name?: unknown; currentPassword?: unknown; newPassword?: unknown;
    } | null;
    if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ").slice(0, 80) : "";
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const changingPassword = currentPassword.length > 0 || newPassword.length > 0;

    if (name.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    if (changingPassword) {
      if (!currentPassword || !newPassword) return NextResponse.json({ error: "Enter both your current and new passwords." }, { status: 400 });
      if (newPassword.length < 10 || newPassword.length > 128) return NextResponse.json({ error: "Your new password must be between 10 and 128 characters." }, { status: 400 });
      if (!verifyPassword(currentPassword, current.passwordHash)) return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
    }

    const users = await readUsers();
    const target = users.find((user) => user.id === current.id);
    if (!target || target.status !== "active") return NextResponse.json({ error: "Your account could not be found." }, { status: 404 });
    target.name = name;
    if (changingPassword) target.passwordHash = hashPassword(newPassword);
    await writeUsers(users);
    return NextResponse.json({ ok: true, user: publicUser(target) });
  } catch (error) {
    console.error("PVNE profile update failed:", error);
    return NextResponse.json({ error: "Could not save your profile. Please try again." }, { status: 503 });
  }
}
