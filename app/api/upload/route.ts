import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif",
  "image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence",
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/csv",
]);
const MAX_FILE_SIZE = 15 * 1024 * 1024;

function normalizedType(file: File, extension: string): string {
  if (file.type) return file.type;
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";
  const types: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
    avif: "image/avif", gif: "image/gif", pdf: "application/pdf", doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain", csv: "text/csv",
  };
  return types[extension] || "application/octet-stream";
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin" || user.status !== "active") {
    return NextResponse.json({ error: "Only active administrators can upload announcement files." }, { status: 403 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured." }, { status: 500 });
  }

  let form: FormData;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ error: "Invalid upload form." }, { status: 400 }); }

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });

  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const type = normalizedType(file, extension);
  const extensionAllowed = ["jpg", "jpeg", "png", "webp", "avif", "gif", "heic", "heif"].includes(extension);
  if (!ALLOWED_TYPES.has(type) && !extensionAllowed) {
    return NextResponse.json({ error: "Unsupported file type. Supported: HEIC/HEIF and common images, PDF, Word, Excel, PowerPoint, TXT, and CSV." }, { status: 415 });
  }
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Each file must be smaller than 15 MB." }, { status: 413 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "attachment";
  try {
    // The store is configured as private. Do not request public access here.
    const blob = await put(`village-announcements/${Date.now()}-${safeName}`, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: type,
    });
    const url = `/api/announcement-files?pathname=${encodeURIComponent(blob.pathname)}`;
    return NextResponse.json({ name: file.name, url, pathname: blob.pathname, type, size: file.size });
  } catch (error) {
    console.error("PVNE announcement upload failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
