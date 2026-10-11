import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readVillageData, writeVillageData } from "@/lib/blob-store";
import type { VillagePost } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Attachment = { name: string; url: string; type: string; size: number };
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "active") return NextResponse.json({ error: "Please log in to view announcements." }, { status: 401 });
    const data = await readVillageData();
    const announcements = data.posts.filter(p => p.type === "announcement").sort((a,b) => Date.parse(b.createdAt)-Date.parse(a.createdAt));
    return NextResponse.json({ announcements }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load announcements." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin" || user.status !== "active") return NextResponse.json({ error: "Only active administrators can publish announcements." }, { status: 403 });
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const title = clean(body.title, 140);
    const content = typeof body.body === "string" ? body.body.trim().slice(0, 8000) : "";
    const location = clean(body.location, 120) || "Pagsibol Village";
    const validAttachments = (value: unknown): Attachment[] => Array.isArray(value) ? value.filter((item): item is Attachment =>
      !!item && typeof item === "object" && typeof (item as Attachment).name === "string" &&
      typeof (item as Attachment).url === "string" && (item as Attachment).url.startsWith("https://") &&
      typeof (item as Attachment).type === "string" && typeof (item as Attachment).size === "number").slice(0,10) : [];
    const photos = validAttachments(body.photos).filter(item => item.type.startsWith("image/"));
    const attachments = validAttachments(body.attachments).filter(item => !item.type.startsWith("image/"));
    if (title.length < 3 || content.length < 5) return NextResponse.json({ error: "Enter a title and announcement details." }, { status: 400 });
    const data = await readVillageData();
    const announcement = {
      id: `notice-${crypto.randomUUID()}`, category: "Official Announcement", title, body: content,
      location, author: user.name, createdAt: new Date().toISOString(), comments: 0,
      type: "announcement" as const, photos, attachments,
    } as VillagePost;
    data.posts.unshift(announcement);
    await writeVillageData(data);
    return NextResponse.json({ ok: true, announcement }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("PVNE announcements POST failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not publish announcement." }, { status: 503 });
  }
}
