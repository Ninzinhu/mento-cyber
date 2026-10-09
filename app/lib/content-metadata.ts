import type { Metadata } from "next";
import { adminDb } from "./firebase-admin";

type ContentMetadataKind = "article" | "discussion" | "radar";

export async function contentMetadata(
  slug: string,
  kind: ContentMetadataKind,
): Promise<Metadata> {
  try {
    const snapshot = await adminDb()
      .collection("contentPosts")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    const data = snapshot.docs[0]?.data();
    if (!data || data.status !== "published" || data.kind !== kind) return {};
    const title = String(data.title || "MentoCyber");
    const description = String(data.excerpt || "Conteúdo da comunidade MentoCyber.");
    const source = String(data.sourceName || data.authorName || "MentoCyber");
    const image =
      data.imageUrl ||
      `/api/noticias/arte?source=${encodeURIComponent(source)}&title=${encodeURIComponent(title)}`;
    return {
      title: `${title} | MentoCyber`,
      description,
      openGraph: { title, description, type: "article", images: [{ url: image }] },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    };
  } catch {
    return {};
  }
}
