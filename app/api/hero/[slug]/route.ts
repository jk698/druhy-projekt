import { NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/articles";
import { generateHeroSvg } from "@/lib/hero-svg";

export const dynamic = "force-static";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    return new NextResponse("Not found", { status: 404 });
  }
  const svg = generateHeroSvg({
    slug: article.slug,
    type: article.type,
    title: article.title,
  });
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
