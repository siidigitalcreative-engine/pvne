import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.status !== "active") {
    return NextResponse.json({ error: "Please sign in to view announcement files." }, { status: 401 });
  }
  const pathname = request.nextUrl.searchParams.get("pathname") || "";
  // Only allow paths within the announcement upload folder.
  if (!pathname.startsWith("village-announcements/") || pathname.includes("..")) {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured." }, { status: 500 });
  }
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }
    const headers = new Headers();
    headers.set("Content-Type", result.blob.contentType || "application/octet-stream");
    headers.set("Cache-Control", "private, no-store");
    headers.set("Content-Disposition", "inline");
    return new NextResponse(result.stream, { status: 200, headers });
  } catch (error) {
    console.error("PVNE announcement file read failed:", error);
    return NextResponse.json({ error: "Could not retrieve this file." }, { status: 500 });
  }
}
