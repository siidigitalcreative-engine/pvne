import "server-only";
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { readUsers, type StoredUser } from "@/lib/user-store";

export const SESSION_COOKIE = "pvne_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
type SessionPayload = { sub: string; exp: number; v: 1 };

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be configured with a random secret of at least 32 characters.");
  return value;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = (stored || "").split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = { sub: userId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS, v: 1 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;
  const expected = Buffer.from(sign(encoded));
  const supplied = Buffer.from(signature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (payload.v !== 1 || !payload.sub || !Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<StoredUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = verifySessionToken(token);
  if (!session) return null;
  const users = await readUsers();
  const user = users.find((item) => item.id === session.sub);
  return user?.status === "active" ? user : null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

export function newUserId(): string {
  return randomUUID();
}
