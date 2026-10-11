import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { get, list, put } from "@vercel/blob";

export type UserRole = "admin" | "member";
export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: "active" | "disabled";
  createdAt: string;
  blockNumber?: string;
  lotNumber?: string;
  streetName?: string;
  colorScheme?: string;
  ownerRelationship?: string;
  ownerRelationshipOther?: string;
};

const USERS_PATH = "pvne-private/users.enc.json";
const SECRET_ENV = "AUTH_SECRET";

function encryptionKey(): Buffer {
  const secret = process.env[SECRET_ENV];
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be configured with a random secret of at least 32 characters.");
  }
  return createHash("sha256").update(secret).digest();
}

function encrypt(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    version: 1,
    iv: iv.toString("base64url"),
    tag: tag.toString("base64url"),
    data: encrypted.toString("base64url"),
  });
}

function decrypt<T>(value: string): T {
  const payload = JSON.parse(value) as {
    version?: number;
    iv?: string;
    tag?: string;
    data?: string;
  };

  if (payload.version !== 1 || !payload.iv || !payload.tag || !payload.data) {
    throw new Error("Stored account data has an invalid format.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(payload.iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.data, "base64url")),
    decipher.final(),
  ]).toString("utf8");

  return JSON.parse(decrypted) as T;
}

export async function readUsers(): Promise<StoredUser[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }

  // The private store is selected by the configured Blob token. The list()
  // options in @vercel/blob 2.8.x do not accept an `access` property.
  const result = await list({ prefix: USERS_PATH, limit: 10 });
  const blob = result.blobs.find((item) => item.pathname === USERS_PATH);
  if (!blob) return [];

  const privateBlob = await get(USERS_PATH, { access: "private" });
  if (!privateBlob || privateBlob.statusCode !== 200) {
    throw new Error("Could not read the account registry from private Blob storage.");
  }

  const responseText = await new Response(privateBlob.stream).text();
  const users = decrypt<unknown>(responseText);

  if (!Array.isArray(users)) {
    throw new Error("Stored account registry is invalid.");
  }

  return users as StoredUser[];
}

export async function writeUsers(users: StoredUser[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }

  await put(USERS_PATH, encrypt(users), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export function publicUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    blockNumber: user.blockNumber ?? "",
    lotNumber: user.lotNumber ?? "",
    streetName: user.streetName ?? "",
    ownerRelationship: user.ownerRelationship ?? "",
    ownerRelationshipOther: user.ownerRelationshipOther ?? "",
  };
}

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 254) : "";
}
