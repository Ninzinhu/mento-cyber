"use client";

import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../community/firebase";
import { starterPosts, type ContentPost } from "./content-model";

function asDate(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    const candidate = value as { toDate: () => Date };
    return candidate.toDate().toISOString();
  }
  return typeof value === "string" ? value : new Date().toISOString();
}

function postFromSnapshot(id: string, value: Record<string, unknown>): ContentPost {
  return {
    id,
    kind:
      value.kind === "article" || value.kind === "discussion" || value.kind === "radar"
        ? value.kind
        : "radar",
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
    publishedAt: asDate(value.publishedAt),
    readingMinutes: Number(value.readingMinutes || 2),
    reactionCount: Number(value.reactionCount || 0),
    commentCount: Number(value.commentCount || 0),
    featured: value.featured === true,
  };
}

export async function getContentPosts(kind?: ContentPost["kind"]) {
  if (!db) return starterPosts.filter((post) => !kind || post.kind === kind);
  const target = query(collection(db, "contentPosts"), limit(80));
  try {
    const snapshot = await getDocs(target);
    const posts = snapshot.docs
      .filter((item) => item.data().status === "published")
      .map((item) => postFromSnapshot(item.id, item.data()));
    const visible = posts
      .filter((post) => !kind || post.kind === kind)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return visible.length
      ? visible
      : starterPosts.filter((post) => !kind || post.kind === kind);
  } catch {
    return starterPosts.filter((post) => !kind || post.kind === kind);
  }
}

export type ContentComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export async function getContentComments(postId: string) {
  if (!db) return [] as ContentComment[];
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "contentComments"),
        where("postId", "==", postId),
        limit(80),
      ),
    );
    return snapshot.docs
      .filter((item) => item.data().status === "published")
      .map((item) => ({
        id: item.id,
        authorName: String(item.data().authorName || "Membro"),
        body: String(item.data().body || ""),
        createdAt: asDate(item.data().createdAt),
      }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return [];
  }
}
