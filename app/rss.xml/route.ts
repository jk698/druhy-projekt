import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/articles";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET(req: Request) {
  const articles = getAllArticles();
  const origin = new URL(req.url).origin;
  const items = articles
    .map((a) => {
      const url = `${origin}/clanky/${a.slug}`;
      const pubDate = new Date(a.date).toUTCString();
      const label = a.type === "A" ? "Typ A · na míru" : "Typ B · trendy";
      return `    <item>
      <title>${escapeXml(`[${label}] ${a.title}`)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(a.hook)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Business příležitosti — denní výběr</title>
    <link>${origin}</link>
    <description>Každý den jedna příležitost na míru a jeden trend ze světa.</description>
    <language>cs-cz</language>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
