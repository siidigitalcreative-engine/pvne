import { NextResponse } from "next/server";
import { hashPassword, createSessionToken, SESSION_COOKIE, sessionCookieOptions, newUserId } from "@/lib/auth";
import { normalizeEmail, readUsers, writeUsers, publicUser, type StoredUser } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RELATIONSHIPS = new Set([
  "owner",
  "co_owner",
  "spouse",
  "domestic_partner",
  "family_member",
  "authorized_representative",
  "tenant",
  "other",
]);

function cleanField(value: unknown, maxLength = 80): string {
  return typeof value === "string" ? value.trim().replace(/\\s+/g, " ").slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = cleanField(body.name);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const blockNumber = cleanField(body.blockNumber, 20);
  const lotNumber = cleanField(body.lotNumber, 20);
  const ownerRelationship = cleanField(body.ownerRelationship, 40);
  const ownerRelationshipOther = cleanField(body.ownerRelationshipOther, 100);

  if (name.length < 2) return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 10 || password.length > 128) return NextResponse.json({ error: "Use a password between 10 and 128 characters." }, { status: 400 });
  if (!blockNumber) return NextResponse.json({ error: "Enter your block number." }, { status: 400 });
  if (!lotNumber) return NextResponse.json({ error: "Enter your lot number." }, { status: 400 });
  if (!RELATIONSHIPS.has(ownerRelationship)) return NextResponse.json({ error: "Select your relationship to the property owner." }, { status: 400 });
  if (ownerRelationship === "other" && !ownerRelationshipOther) return NextResponse.json({ error: "Please specify your relationship to the property owner." }, { status: 400 });

  try {
    const users = await readUsers();
    if (users.some((user) => user.email === email)) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const bootstrapEmail = normalizeEmail(process.env.PVNE_BOOTSTRAP_ADMIN_EMAIL);
    const firstAdmin = Boolean(bootstrapEmail) && email === bootstrapEmail && !users.some((existing) => existing.role === "admin");
    const user: StoredUser = {
      id: newUserId(),
      name,
      email,
      passwordHash: hashPassword(password),
      role: firstAdmin ? "admin" : "member",
      status: "active",
      createdAt: new Date().toISOString(),
      blockNumber,
      lotNumber,
      ownerRelationship,
      ownerRelationshipOther: ownerRelationship === "other" ? ownerRelationshipOther : "",
    };

    users.push(user);
    await writeUsers(users);

    const response = NextResponse.json({ ok: true, user: publicUser(user) }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("PVNE signup failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create the account." }, { status: 503 });
  }
}
