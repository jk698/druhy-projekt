import type { MetadataRoute } from "next";

// Soukromý web — zakázat všem crawlerům. Spolu s noindex hlavičkou
// (next.config.mjs) a meta robots (layout) drží web mimo vyhledávače.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
