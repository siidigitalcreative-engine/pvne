import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { normalizeEmail, readUsers, publicUser } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  try {
    const users = await readUsers();
    const user = users.find((item) => item.email === email);
    if (!user || user.status !== "active" || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true, user: publicUser(user) });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("PVNE login failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not sign in." }, { status: 503 });
  }
}
