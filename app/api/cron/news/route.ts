import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Feed = {
  name: string;
  url: string;
  tags: string[];
  region: "Brasil" | "Global";
};

const feeds: Feed[] = [
  {
    name: "CISA",
    url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    tags: ["Vulnerabilidades", "Incidentes"],
    region: "Global",
  },
  {
    name: "BleepingComputer",
    url: "https://www.bleepingcomputer.com/feed/",
    tags: ["Incidentes", "Vulnerabilidades"],
    region: "Global",
  },
  {
    name: "Krebs on Security",
    url: "https://krebsonsecurity.com/feed/",
    tags: ["Pesquisa", "Incidentes"],
    region: "Global",
  },
  {
    name: "Google Online Security",
    url: "https://feeds.feedburner.com/GoogleOnlineSecurityBlog",
    tags: ["Vulnerabilidades", "Cloud Security"],
    region: "Global",
  },
  {
    name: "The Hacker News",
    url: "https://feeds.feedburner.com/TheHackersNews",
    tags: ["Incidentes", "Pesquisa"],
    region: "Global",
  },
  {
    name: "SecurityWeek",
    url: "https://www.securityweek.com/feed/",
    tags: ["Vulnerabilidades", "Pesquisa"],
    region: "Global",
  },
  {
    name: "Dark Reading",
    url: "https://www.darkreading.com/rss.xml",
    tags: ["Incidentes", "Cloud Security"],
    region: "Global",
  },
  {
    name: "The Record",
    url: "https://therecord.media/feed",
    tags: ["Incidentes", "Pesquisa"],
    region: "Global",
  },
  {
    name: "Malwarebytes",
    url: "https://www.malwarebytes.com/blog/feed",
    tags: ["Malware", "Golpes"],
    region: "Global",
  },
  {
    name: "Cloudflare",
    url: "https://blog.cloudflare.com/rss/",
    tags: ["Cloud Security", "Ataques"],
    region: "Global",
  },
  {
    name: "Cisco Talos",
    url: "https://blog.talosintelligence.com/rss/",
    tags: ["Malware", "Pesquisa"],
    region: "Global",
  },
  {
    name: "Unit 42",
    url: "https://unit42.paloaltonetworks.com/feed/",
    tags: ["Malware", "Pesquisa"],
    region: "Global",
  },
  {
    name: "Tecnoblog",
    url: "https://tecnoblog.net/feed/",
    tags: ["Tecnologia", "Privacidade"],
    region: "Brasil",
  },
  {
    name: "Canaltech",
    url: "https://canaltech.com.br/rss/",
    tags: ["Tecnologia", "Segurança"],
    region: "Brasil",
  },
  {
    name: "Olhar Digital",
    url: "https://olhardigital.com.br/feed/",
    tags: ["Tecnologia", "Segurança"],
    region: "Brasil",
  },
  {
    name: "TecMundo",
    url: "https://www.tecmundo.com.br/rss",
    tags: ["Tecnologia", "Segurança"],
    region: "Brasil",
  },
  {
    name: "CISO Advisor",
    url: "https://www.cisoadvisor.com.br/feed/",
    tags: ["Segurança", "Pesquisa"],
    region: "Brasil",
  },
  {
    name: "Security Report",
    url: "https://securityreport.com.br/feed/",
    tags: ["Segurança", "Incidentes"],
    region: "Brasil",
  },
];

const topicTerms = [
  "security",
  "cyber",
  "ciber",
  "vulnerab",
  "cve",
  "malware",
  "ransom",
  "phishing",
  "golpe",
  "fraud",
  "scam",
  "vazamento",
  "leak",
  "breach",
  "ataque",
  "attack",
  "hacker",
  "exploit",
  "privacy",
  "privacidade",
  "dados",
  "data",
  "ddos",
  "botnet",
  "spyware",
  "rce",
  "zero-day",
  "zeroday",
  "segurança",
];

type FeedItem = {
  title: string;
  url: string;
  excerpt: string;
  imageUrl?: string;
  publishedAt: string;
};

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function urlAttribute(block: string, expression: RegExp) {
  const value = block.match(expression)?.[1] || "";
  try {
    const url = new URL(decode(value));
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function imageFrom(block: string) {
  return (
    urlAttribute(
      block,
      /<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["'][^>]*>/i,
    ) ||
    urlAttribute(block, /<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i) ||
    urlAttribute(block, /<img[^>]+src=["']([^"']+)["'][^>]*>/i)
  );
}

function valueOf(block: string, tag: string) {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"),
  );
  return match ? decode(match[1]) : "";
}

function entries(xml: string, feed: Feed): FeedItem[] {
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
        imageUrl: imageFrom(block),
        publishedAt: Number.isNaN(Date.parse(date))
          ? new Date().toISOString()
          : new Date(date).toISOString(),
      };
    })
    .filter((item) => {
      const haystack = `${item.title} ${item.excerpt}`.toLowerCase();
      return (
        item.title &&
        /^https:\/\//i.test(item.url) &&
        (feed.region === "Global" || topicTerms.some((term) => haystack.includes(term)))
      );
    })
    .slice(0, 12);
}

function canonicalUrl(value: string) {
  try {
    const url = new URL(value);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(
      (key) => url.searchParams.delete(key),
    );
    url.hash = "";
    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}

function canonicalTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(the|a|an|and|or|de|da|do|das|dos|e|em|para|com|por)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) throw new Error(`${feed.name}: ${response.status}`);
      return { feed, items: entries(await response.text(), feed) };
    }),
  );
  const existing = await db
    .collection("contentPosts")
    .where("kind", "==", "radar")
    .limit(600)
    .get();
  const knownUrls = new Set(
    existing.docs.map((item) => canonicalUrl(String(item.data().sourceUrl || ""))),
  );
  const knownTitles = new Set(
    existing.docs.map((item) => canonicalTitle(String(item.data().title || ""))),
  );
  const imported = [] as Array<{ source: string; imported: number; skipped: number }>;
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { feed, items } = result.value;
    let count = 0;
    let skipped = 0;
    for (const item of items) {
      const sourceUrl = canonicalUrl(item.url);
      const titleKey = canonicalTitle(item.title);
      if (knownUrls.has(sourceUrl) || knownTitles.has(titleKey)) {
        skipped += 1;
        continue;
      }
      const id = createHash("sha256").update(sourceUrl).digest("hex").slice(0, 32);
      await db
        .collection("contentPosts")
        .doc(`radar_${id}`)
        .set({
          kind: "radar",
          title: item.title,
          slug: `radar-${id}`,
          excerpt: item.excerpt || "Leia a cobertura original na fonte indicada.",
          tags: feed.tags,
          region: feed.region,
          authorName: "Notícias MentoCyber",
          sourceName: feed.name,
          sourceUrl,
          imageUrl: item.imageUrl || null,
          status: "published",
          visibility: "public",
          publishedAt: item.publishedAt,
          ingestedAt: FieldValue.serverTimestamp(),
          reactionCount: 0,
          commentCount: 0,
        });
      knownUrls.add(sourceUrl);
      knownTitles.add(titleKey);
      count += 1;
    }
    imported.push({ source: feed.name, imported: count, skipped });
  }
  const failures = results.flatMap((result) =>
    result.status === "rejected" ? [String(result.reason)] : [],
  );
  return NextResponse.json({ ok: true, imported, failures });
}
