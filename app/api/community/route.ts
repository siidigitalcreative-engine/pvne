import { NextRequest, NextResponse } from "next/server";
import { get, list, put } from "@vercel/blob";
import { seedPosts } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Comment = { id: string; author: string; body: string; createdAt: string; replies: Comment[] };
type Discussion = (typeof seedPosts)[number] & { commentsList: Comment[]; likes: number };
const PATH = "village-data/community-discussions.json";
async function read(): Promise<Discussion[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Persistent storage is not configured.");
  try {
    const result = await list({ prefix: PATH, limit: 10 });
    const blob = result.blobs.find((item) => item.pathname === PATH);
    if (!blob) return [];
    const response = await get(PATH, { access: "private" });
    if (!response || response.statusCode !== 200) throw new Error("Could not read community discussions from private Blob storage.");
    const data = await new Response(response.stream).json();
    if (!Array.isArray(data)) throw new Error("Saved community discussions have an invalid format.");
    return data;
  } catch (error) { throw error instanceof Error ? error : new Error("Could not read community discussions."); }
}
async function write(items: Discussion[]) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Persistent storage is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel environment variables.");
  await put(PATH, JSON.stringify(items), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 0 });
}
const newId = () => crypto.randomUUID();
const clean = (value: unknown, max = 1500) => typeof value === "string" ? value.trim().slice(0, max) : "";
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.status !== "active") return NextResponse.json({ error: "Please log in to view community discussions." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    return NextResponse.json({ posts: await read(), persistent: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load community discussions." }, { status: 503 });
  }
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
