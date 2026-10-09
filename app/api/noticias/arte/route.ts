import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

function trim(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1).trimEnd()}…` : value;
}

function artText(value: string, length: number) {
  return trim(
    value
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    length,
  );
}

export function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const source = artText(query.get("source") || "NOTÍCIAS MENTOCYBER", 38);
  const title = artText(query.get("title") || "Atualização de segurança", 112);
  const safeSource = escapeXml(source.toUpperCase());
  const safeTitle = escapeXml(title);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="640" viewBox="0 0 1280 640" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="52" height="52" patternUnits="userSpaceOnUse">
      <path d="M52 0H0V52" stroke="#393943" stroke-width="1" />
    </pattern>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#17171D" />
      <stop offset="1" stop-color="#0B0B0E" />
    </linearGradient>
  </defs>
  <rect width="1280" height="640" fill="url(#fade)" />
  <rect width="1280" height="640" fill="url(#grid)" opacity="0.7" />
  <path d="M-38 642L648 -28" stroke="#585866" stroke-width="11" opacity="0.72" />
  <circle cx="1034" cy="198" r="210" stroke="#4B4B58" stroke-width="2" opacity="0.72" />
  <circle cx="1034" cy="198" r="126" stroke="#4B4B58" stroke-width="2" opacity="0.45" />
  <path d="M862 436C945 371 1110 356 1237 418" stroke="#6E6E7B" stroke-width="3" opacity="0.5" />
  <circle cx="833" cy="447" r="7" fill="#F3F3F6" />
  <text x="72" y="84" fill="#D2D2DB" font-family="monospace" font-size="23" letter-spacing="4">NOTÍCIA / MENTOCYBER</text>
  <text x="72" y="502" fill="#F5F5F7" font-family="Arial, sans-serif" font-size="46" font-weight="700">${safeTitle}</text>
  <rect x="72" y="548" width="8" height="8" fill="#F5F5F7" />
  <text x="96" y="557" fill="#C5C5CE" font-family="monospace" font-size="20" letter-spacing="2">${safeSource}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
