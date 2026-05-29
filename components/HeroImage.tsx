"use client";

import { useState } from "react";

/**
 * Zobrazí reálnou fotku (z frontmatteru `image`). Když fotka chybí nebo se
 * nenačte (mrtvý odkaz), spadne zpět na generované SVG `/api/hero/[slug]`.
 */
export function HeroImage({
  slug,
  src,
  alt = "",
  className = "",
}: {
  slug: string;
  src?: string;
  alt?: string;
  className?: string;
}) {
  const fallback = `/api/hero/${slug}`;
  const [current, setCurrent] = useState(src && src.length > 0 ? src : fallback);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
