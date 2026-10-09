import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const feeds = [
  {
    name: "CISA",
    url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    tags: ["Vulnerabilidades", "Incidentes"],
  },
  {
    name: "BleepingComputer",
    url: "https://www.bleepingcomputer.com/feed/",
    tags: ["Incidentes", "Vulnerabilidades"],
  },
  {
    name: "Krebs on Security",
    url: "https://krebsonsecurity.com/feed/",
    tags: ["Pesquisa", "Incidentes"],
  },
  {
    name: "Google Online Security",
    url: "https://feeds.feedburner.com/GoogleOnlineSecurityBlog",
    tags: ["Vulnerabilidades", "Cloud Security"],
  },
  {
    name: "The Hacker News",
    url: "https://feeds.feedburner.com/TheHackersNews",
    tags: ["Incidentes", "Pesquisa"],
  },
] as const;

type FeedItem = { title: string; url: string; excerpt: string; publishedAt: string };

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function valueOf(block: string, tag: string) {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"),
  );
  return match ? decode(match[1]) : "";
}

function entries(xml: string): FeedItem[] {
  const blocks =
    xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi) || [];
  return blocks
    .map((block) => {
      const atomLink = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] || "";
      const url = valueOf(block, "link") || atomLink;
      const title = valueOf(block, "title");
      const excerpt =
        valueOf(block, "description") ||
        valueOf(block, "summary") ||
        valueOf(block, "content");
      const date =
        valueOf(block, "pubDate") ||
        valueOf(block, "published") ||
        valueOf(block, "updated");
      return {
        title: title.slice(0, 180),
        url,
        excerpt: excerpt.slice(0, 420),
        publishedAt: Number.isNaN(Date.parse(date))
          ? new Date().toISOString()
          : new Date(date).toISOString(),
      };
    })
    .filter((item) => item.title && /^https:\/\//i.test(item.url))
    .slice(0, 12);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("authorization") !== `Bearer ${secret}`
  ) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  if (process.env.NODE_ENV === "production" && !secret) {
    return NextResponse.json(
      { error: "CRON_SECRET não configurado." },
      { status: 500 },
    );
  }

  const db = adminDb();
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const response = await fetch(feed.url, {
        headers: { "User-Agent": "MentoCyber-Radar/1.0 (+https://mentocyber.com)" },
        next: { revalidate: 0 },
      });
      if (!response.ok) throw new Error(`${feed.name}: ${response.status}`);
      const items = entries(await response.text());
      await Promise.all(
        items.map(async (item) => {
          const id = createHash("sha256").update(item.url).digest("hex").slice(0, 32);
          await db
            .collection("contentPosts")
            .doc(`radar_${id}`)
            .set(
              {
                kind: "radar",
                title: item.title,
                slug: `radar-${id}`,
                excerpt: item.excerpt || "Leia a cobertura original na fonte indicada.",
                tags: feed.tags,
                authorName: "Radar MentoCyber",
                sourceName: feed.name,
                sourceUrl: item.url,
                status: "published",
                visibility: "public",
                publishedAt: item.publishedAt,
                ingestedAt: FieldValue.serverTimestamp(),
                reactionCount: 0,
                commentCount: 0,
              },
              { merge: true },
            );
        }),
      );
      return { source: feed.name, imported: items.length };
    }),
  );
  const imported = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  const failures = results.flatMap((result) =>
    result.status === "rejected" ? [String(result.reason)] : [],
  );
  return NextResponse.json({ ok: true, imported, failures });
}
