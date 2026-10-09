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

export async function getContentPosts(kind?: ContentPost["kind"]) {
  try {
    const search = kind ? `?kind=${encodeURIComponent(kind)}` : "";
    const response = await fetch(`/api/content/posts${search}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Conteúdos indisponíveis.");
    const payload = (await response.json()) as { posts?: ContentPost[] };
    const visible = Array.isArray(payload.posts) ? payload.posts : [];
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
