import { NextRequest, NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  replies: Comment[];
};

type Discussion = {
  id: string;
  category: string;
  title: string;
  body: string;
  location?: string;
  author: string;
  createdAt: string;
  comments: number;
  type: "post" | "announcement";
  commentsList: Comment[];
  likes: number;
};

const PATH = "village-data/community-discussions.json";
const EMPTY: Discussion[] = [];
const DEMO_IDS = new Set(["post-1", "post-2", "post-3", "post-4", "post-5", "post-6"]);

function clean(value: unknown, max = 1500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function readPosts(): Promise<Discussion[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Persistent storage is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel environment variables.");
  }

  const result = await list({ prefix: PATH, limit: 10 });
  const blob = result.blobs.find((item) => item.pathname === PATH);
  if (!blob) return EMPTY;

  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not read community posts (HTTP ${response.status}).`);

  const value: unknown = await response.json();
  if (!Array.isArray(value)) throw new Error("Stored community posts have an invalid format.");

  const filtered = (value as Discussion[]).filter((post) => post && !DEMO_IDS.has(post.id));
  if (filtered.length !== value.length) await writePosts(filtered);
  return filtered;
}

async function writePosts(posts: Discussion[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Persistent storage is not configured. Changes were not saved.");
  }
  await put(PATH, JSON.stringify(posts), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

const newId = () => crypto.randomUUID();

export async function GET() {
  try {
    const posts = await readPosts();
    return NextResponse.json(
      { posts, persistent: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return NextResponse.json(
      { posts: [], persistent: false, error: error instanceof Error ? error.message : "Community data could not be loaded." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to participate in the community." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const posts = await readPosts();

    if (body.action === "create") {
      const title = clean(body.title, 120);
      const text = clean(body.body, 3000);
      const category = clean(body.category, 60);
      const location = clean(body.location, 80) || "Village-wide";

      if (title.length < 4 || text.length < 5 || !category) {
        return NextResponse.json({ error: "Add a topic, category, and a little more detail." }, { status: 400 });
      }

      const post: Discussion = {
        id: newId(),
        title,
        body: text,
        category,
        author: user.name,
        location,
        createdAt: new Date().toISOString(),
        comments: 0,
        type: "post",
        likes: 0,
        commentsList: [],
      };

      await writePosts([post, ...posts]);
      return NextResponse.json({ post, persistent: true });
    }

    const post = posts.find((item) => item.id === body.postId);
    if (!post) return NextResponse.json({ error: "Discussion not found. Refresh and try again." }, { status: 404 });

    if (body.action === "comment" || body.action === "reply") {
      const text = clean(body.body, 1500);
      if (!text) return NextResponse.json({ error: "Write a message first." }, { status: 400 });

      const item: Comment = {
        id: newId(),
        author: user.name,
        body: text,
        createdAt: new Date().toISOString(),
        replies: [],
      };

      if (body.action === "comment") {
        post.commentsList = Array.isArray(post.commentsList) ? post.commentsList : [];
        post.commentsList.push(item);
      } else {
        const parent = (post.commentsList || []).find((comment) => comment.id === body.commentId);
        if (!parent) return NextResponse.json({ error: "Reply thread not found." }, { status: 404 });
        parent.replies = Array.isArray(parent.replies) ? parent.replies : [];
        parent.replies.push(item);
      }

      post.comments = post.commentsList.length;
      await writePosts(posts);
      return NextResponse.json({ post, persistent: true });
    }

    if (body.action === "like") {
      post.likes = Math.max(0, Number(post.likes || 0) + (body.liked ? -1 : 1));
      await writePosts(posts);
      return NextResponse.json({ post, persistent: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save community changes." },
      { status: 503 },
    );
  }
}
