import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ALLOWED_TYPES = new Set([
  "image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence",
  "application/pdf","application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation","text/plain","text/csv"
]);
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin" || user.status !== "active") return NextResponse.json({ error: "Only active administrators can upload announcement files." }, { status: 403 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured." }, { status: 500 });
  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: "Invalid upload form." }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isHeicByExtension = ["heic", "heif"].includes(extension);
  const isAllowed = ALLOWED_TYPES.has(file.type) || (file.type.startsWith("image/") && ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(extension)) || isHeicByExtension;
  if (!isAllowed) return NextResponse.json({ error: "Unsupported file type. Supported: HEIC/HEIF and common images, PDF, Word, Excel, PowerPoint, TXT, and CSV." }, { status: 415 });
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Each file must be smaller than 15 MB." }, { status: 413 });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "attachment";
  try {
    const blob = await put(`village-announcements/${Date.now()}-${safeName}`, file, {
      access: "public", addRandomSuffix: true, contentType: file.type || (extension === "heic" ? "image/heic" : extension === "heif" ? "image/heif" : "application/octet-stream"), cacheControlMaxAge: 3600
    });
    return NextResponse.json({ name: file.name, url: blob.url, pathname: blob.pathname, type: file.type, size: file.size });
  } catch (error) {
    console.error("PVNE announcement upload failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
