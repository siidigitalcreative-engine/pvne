import { NextRequest, NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { seedPosts } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Comment = { id: string; author: string; body: string; createdAt: string; replies: Comment[] };
type Discussion = (typeof seedPosts)[number] & { commentsList: Comment[]; likes: number };
const PATH = "village-data/community-discussions.json";
const seed: Discussion[] = seedPosts.filter((p) => p.type === "post").map((p, i) => ({ ...p, likes: [8, 5, 3, 2][i] ?? 0, commentsList: i === 0 ? [{ id: "c1", author: "Ana R.", body: "I can recommend someone who helped us last month.", createdAt: new Date(Date.now() - 1200000).toISOString(), replies: [{ id: "r1", author: "Marco D.", body: "Could you share their contact details by private message?", createdAt: new Date(Date.now() - 720000).toISOString(), replies: [] }] }] : [] }));
async function read(): Promise<Discussion[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return seed;
  try {
    const result = await list({ prefix: PATH, limit: 10 });
    const blob = result.blobs.find((item) => item.pathname === PATH);
    if (!blob) return seed;
    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) return seed;
    const data = await response.json();
    return Array.isArray(data) ? data : seed;
  } catch { return seed; }
}
async function write(items: Discussion[]) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Persistent storage is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel environment variables.");
  await put(PATH, JSON.stringify(items), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 0 });
}
const newId = () => crypto.randomUUID();
const clean = (value: unknown, max = 1500) => typeof value === "string" ? value.trim().slice(0, max) : "";
export async function GET() {
  return NextResponse.json({ posts: await read(), persistent: Boolean(process.env.BLOB_READ_WRITE_TOKEN) }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to participate in the community." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const posts = await read();
  try {
    if (body.action === "create") {
      const title = clean(body.title, 120), text = clean(body.body, 3000), category = clean(body.category, 60);
      if (title.length < 4 || text.length < 5 || !category) return NextResponse.json({ error: "Add a topic, category, and a little more detail." }, { status: 400 });
      const post: Discussion = { id: newId(), title, body: text, category, author: user.name, location: clean(body.location, 80) || "Village-wide", createdAt: new Date().toISOString(), comments: 0, type: "post", likes: 0, commentsList: [] };
      posts.unshift(post); await write(posts); return NextResponse.json({ post, persistent: true });
    }
    const post = posts.find((item) => item.id === body.postId);
    if (!post) return NextResponse.json({ error: "Discussion not found. Refresh and try again." }, { status: 404 });
    if (body.action === "comment" || body.action === "reply") {
      const text = clean(body.body, 1500);
      if (!text) return NextResponse.json({ error: "Write a message first." }, { status: 400 });
      const item: Comment = { id: newId(), author: user.name, body: text, createdAt: new Date().toISOString(), replies: [] };
      if (body.action === "comment") post.commentsList.push(item);
      else {
        const parent = post.commentsList.find((comment) => comment.id === body.commentId);
        if (!parent) return NextResponse.json({ error: "Reply thread not found." }, { status: 404 });
        parent.replies.push(item);
      }
      post.comments = post.commentsList.length; await write(posts); return NextResponse.json({ post, persistent: true });
    }
    if (body.action === "like") {
      post.likes = Math.max(0, post.likes + (body.liked ? -1 : 1)); await write(posts); return NextResponse.json({ post, persistent: true });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save discussion." }, { status: 503 });
  }
}
