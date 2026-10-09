import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import {
  contentKinds,
  type ContentKind,
  type ContentPost,
} from "../../../features/content/content-model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asDate(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof value === "string" ? value : new Date().toISOString();
}

function serializePost(id: string, value: Record<string, unknown>): ContentPost {
  return {
    id,
    kind: contentKinds.includes(value.kind as ContentKind)
      ? (value.kind as ContentKind)
      : "article",
    title: String(value.title || "Sem título"),
    slug: String(value.slug || id),
    excerpt: String(value.excerpt || ""),
    body: typeof value.body === "string" ? value.body : undefined,
    tags: Array.isArray(value.tags)
      ? value.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    authorName: String(value.authorName || "MentoCyber"),
    authorId: typeof value.authorId === "string" ? value.authorId : undefined,
    sourceName: typeof value.sourceName === "string" ? value.sourceName : undefined,
    sourceUrl: typeof value.sourceUrl === "string" ? value.sourceUrl : undefined,
    imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : undefined,
    publishedAt: asDate(value.publishedAt),
    readingMinutes: Number(value.readingMinutes || 2),
    reactionCount: Number(value.reactionCount || 0),
    commentCount: Number(value.commentCount || 0),
    featured: value.featured === true,
  };
}

export async function GET(request: NextRequest) {
  const requestedKind = request.nextUrl.searchParams.get("kind");
  const kind = contentKinds.includes(requestedKind as ContentKind)
    ? (requestedKind as ContentKind)
    : undefined;
  const snapshot = await adminDb()
    .collection("contentPosts")
    .where("status", "==", "published")
    .limit(160)
    .get();
  const posts = snapshot.docs
    .map((item) => serializePost(item.id, item.data()))
    .filter((post) => !kind || post.kind === kind)
    .sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));

  return NextResponse.json({ posts });
}
