import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.VILLAGE_ADMIN_KEY;
  if (!secret || request.headers.get("x-village-admin-key") !== secret) {
    return NextResponse.json({ error: "Unauthorized. Admin key required." }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured." }, { status: 500 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, and AVIF images are accepted." }, { status: 415 });
  }
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Maximum image size is 8 MB." }, { status: 413 });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "upload";
  const blob = await put(`village-uploads/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type
  });
  return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}
