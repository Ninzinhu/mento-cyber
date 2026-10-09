import { createHash } from "crypto";
import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
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
  body: string;
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
    .replace(/&hellip;/g, "…")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function attribute(tag: string, name: string) {
  const match = tag.match(
    new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match?.[1] || match?.[2] || match?.[3] || "";
}

function httpsUrl(value: string) {
  try {
    const url = new URL(decode(value));
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function urlAttribute(block: string, expression: RegExp) {
  const value = block.match(expression)?.[1] || "";
  return httpsUrl(value);
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

function metaContent(html: string, property: string) {
  const tag = (html.match(/<meta\b[^>]*>/gi) || []).find((candidate) => {
    const key = attribute(candidate, "property") || attribute(candidate, "name");
    return key.toLowerCase() === property.toLowerCase();
  });
  return tag ? attribute(tag, "content") : "";
}

function articleImage(html: string) {
  const candidates = (html.match(/<img\b[^>]*>/gi) || [])
    .map((tag) => {
      const source =
        attribute(tag, "data-src") ||
        attribute(tag, "data-lazy-src") ||
        attribute(tag, "src");
      const url = httpsUrl(source);
      const hint =
        `${attribute(tag, "class")} ${attribute(tag, "alt")} ${source}`.toLowerCase();
      const score =
        (/(wp-post-image|featured|post-thumbnail|entry-content|attachment)/.test(hint)
          ? 8
          : 0) +
        (/wp-content\/uploads|\/uploads\//.test(hint) ? 4 : 0) -
        (/(logo|avatar|icon|advert|banner|sponsor|tracking)/.test(hint) ? 12 : 0);
      return { url, score };
    })
    .filter((candidate): candidate is { url: string; score: number } =>
      Boolean(candidate.url),
    )
    .sort((first, second) => second.score - first.score);
  return candidates[0]?.url;
}

function articleLead(html: string) {
  const article =
    html.match(
      /<(?:article|main)\b[^>]*>([\s\S]{0,180000}?)<\/(?:article|main)>/i,
    )?.[1] || html;
  const paragraphs = (article.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || [])
    .map((paragraph) => decode(paragraph))
    .filter((paragraph) => paragraph.length >= 90)
    .filter(
      (paragraph) =>
        !/(cookie|privacidade|newsletter|subscribe|anuncie)/i.test(paragraph),
    );
  return paragraphs.join(" ").slice(0, 1_100);
}

function trustedArticleUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const trusted = [
      "cisa.gov",
      "bleepingcomputer.com",
      "krebsonsecurity.com",
      "googleblog.com",
      "thehackernews.com",
      "securityweek.com",
      "darkreading.com",
      "therecord.media",
      "malwarebytes.com",
      "cloudflare.com",
      "talosintelligence.com",
      "paloaltonetworks.com",
      "tecnoblog.net",
      "canaltech.com.br",
      "olhardigital.com.br",
      "tecmundo.com.br",
      "cisoadvisor.com.br",
      "securityreport.com.br",
    ];
    return (
      url.protocol === "https:" &&
      trusted.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
    );
  } catch {
    return false;
  }
}

async function enrichFromSource(item: FeedItem) {
  if (!trustedArticleUrl(item.url)) return item;
  try {
    const response = await fetch(item.url, {
      headers: { "User-Agent": "MentoCyber-News/1.0 (+https://mentocyber.com)" },
      signal: AbortSignal.timeout(7_000),
      next: { revalidate: 0 },
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html"))
      return item;
    const html = (await response.text()).slice(0, 350_000);
    const imageUrl =
      httpsUrl(metaContent(html, "og:image")) ||
      httpsUrl(metaContent(html, "twitter:image")) ||
      httpsUrl(
        attribute(
          html.match(/<link\b[^>]*rel=["']image_src["'][^>]*>/i)?.[0] || "",
          "href",
        ),
      ) ||
      articleImage(html) ||
      item.imageUrl;
    const description = decode(
      metaContent(html, "og:description") || metaContent(html, "description"),
    ).slice(0, 1_600);
    const lead = articleLead(html);
    return {
      ...item,
      imageUrl,
      excerpt: description || item.excerpt,
      body: lead || description || item.body,
    };
  } catch {
    return item;
  }
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
        valueOf(block, "content:encoded") ||
        valueOf(block, "content");
      const date =
        valueOf(block, "pubDate") ||
        valueOf(block, "published") ||
        valueOf(block, "updated");
      return {
        title: title.slice(0, 180),
        url,
        excerpt: excerpt.slice(0, 560),
        body: excerpt.slice(0, 1_600),
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
  const forceImageRefresh =
    new URL(request.url).searchParams.get("refreshImages") === "1";
  const forceContextRefresh =
    new URL(request.url).searchParams.get("refreshContext") === "1";
  const enrichmentLimit = forceImageRefresh || forceContextRefresh ? 80 : 24;
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
  const existingByUrl = new Map<
    string,
    { ref: DocumentReference; needsEnrichment: boolean }
  >(
    existing.docs.map((item) => [
      canonicalUrl(String(item.data().sourceUrl || "")),
      {
        ref: item.ref,
        needsEnrichment:
          (!item.data().imageUrl &&
            (forceImageRefresh || !item.data().imageCheckedAt)) ||
          (forceContextRefresh &&
            String(item.data().body || "").length < 700 &&
            !item.data().contextCheckedAt),
      },
    ]),
  );
  const knownUrls = new Set(existingByUrl.keys());
  const knownTitles = new Set(
    existing.docs.map((item) => canonicalTitle(String(item.data().title || ""))),
  );
  const imported = [] as Array<{ source: string; imported: number; skipped: number }>;
  const enrichments: Array<{ ref: DocumentReference; item: FeedItem }> = [];
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { feed, items } = result.value;
    let count = 0;
    let skipped = 0;
    for (const item of items) {
      const sourceUrl = canonicalUrl(item.url);
      const titleKey = canonicalTitle(item.title);
      const existingPost = existingByUrl.get(sourceUrl);
      if (existingPost || knownTitles.has(titleKey)) {
        if (existingPost?.needsEnrichment && enrichments.length < enrichmentLimit)
          enrichments.push({
            ref: existingPost.ref,
            item: { ...item, url: sourceUrl },
          });
        skipped += 1;
        continue;
      }
      const id = createHash("sha256").update(sourceUrl).digest("hex").slice(0, 32);
      const ref = db.collection("contentPosts").doc(`radar_${id}`);
      await ref.set({
        kind: "radar",
        title: item.title,
        slug: `radar-${id}`,
        excerpt: item.excerpt || "Leia a cobertura original na fonte indicada.",
        body:
          item.body || item.excerpt || "Leia a cobertura original na fonte indicada.",
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
      existingByUrl.set(sourceUrl, {
        ref,
        needsEnrichment: !item.imageUrl,
      });
      if (!item.imageUrl && enrichments.length < enrichmentLimit)
        enrichments.push({ ref, item: { ...item, url: sourceUrl } });
      count += 1;
    }
    imported.push({ source: feed.name, imported: count, skipped });
  }
  await Promise.all(
    enrichments.map(async ({ ref, item }) => {
      const enriched = await enrichFromSource(item);
      await ref.set(
        {
          imageUrl: enriched.imageUrl || null,
          excerpt: enriched.excerpt || item.excerpt,
          body: enriched.body || item.body,
          imageCheckedAt: FieldValue.serverTimestamp(),
          contextCheckedAt: FieldValue.serverTimestamp(),
          enrichedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }),
  );
  const failures = results.flatMap((result) =>
    result.status === "rejected" ? [String(result.reason)] : [],
  );
  return NextResponse.json({ ok: true, imported, failures });
}
