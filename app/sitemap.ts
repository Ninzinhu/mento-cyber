import type { MetadataRoute } from "next";
import { adminDb } from "./lib/firebase-admin";

export const dynamic = "force-dynamic";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://mentocyber.com").replace(
  /\/$/,
  "",
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/conteudos",
    "/noticias",
    "/discussoes",
    "/newsletter",
    "/operacoes",
  ].map((path, index) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/noticias" ? "daily" : "weekly",
    priority: index === 0 ? 1 : 0.8,
  }));
  try {
    const snapshot = await adminDb()
      .collection("contentPosts")
      .where("status", "==", "published")
      .limit(500)
      .get();
    const contentPages: MetadataRoute.Sitemap = snapshot.docs.map((item) => {
      const post = item.data();
      const section =
        post.kind === "radar"
          ? "noticias"
          : post.kind === "discussion"
            ? "discussoes"
            : "artigos";
      const publishedAt = post.publishedAt?.toDate?.() || new Date();
      return {
        url: `${baseUrl}/${section}/${encodeURIComponent(String(post.slug || item.id))}`,
        lastModified: publishedAt,
        changeFrequency: post.kind === "radar" ? "weekly" : "monthly",
        priority: post.featured ? 0.9 : 0.6,
      };
    });
    return [...staticPages, ...contentPages];
  } catch {
    return staticPages;
  }
}
