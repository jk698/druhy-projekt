import type { ArticleType } from "./types";

/** Deterministický hash → 0..1 */
function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length];
}

const PALETTES_A = [
  ["#fed7aa", "#fb923c", "#9a3412"],
  ["#fde68a", "#f59e0b", "#7c2d12"],
  ["#fecaca", "#ef4444", "#7f1d1d"],
  ["#fbcfe8", "#ec4899", "#831843"],
  ["#fef3c7", "#d97706", "#92400e"],
];

const PALETTES_B = [
  ["#bfdbfe", "#3b82f6", "#1e3a8a"],
  ["#bae6fd", "#0ea5e9", "#0c4a6e"],
  ["#c7d2fe", "#6366f1", "#312e81"],
  ["#a7f3d0", "#10b981", "#064e3b"],
  ["#e9d5ff", "#a855f7", "#581c87"],
];

/**
 * Vygeneruje SVG hero obrázek pro daný článek. Deterministické z (slug, type).
 */
export function generateHeroSvg({
  slug,
  type,
  title,
  width = 1200,
  height = 700,
}: {
  slug: string;
  type: ArticleType;
  title: string;
  width?: number;
  height?: number;
}): string {
  const r1 = hash01(slug);
  const r2 = hash01(slug + "x");
  const r3 = hash01(slug + "y");
  const r4 = hash01(slug + "z");

  const palettes = type === "A" ? PALETTES_A : PALETTES_B;
  const [c1, c2, c3] = pick(palettes, r1);

  const blob1 = {
    cx: 200 + r2 * 400,
    cy: 200 + r3 * 200,
    rx: 200 + r4 * 200,
    ry: 150 + r1 * 200,
  };
  const blob2 = {
    cx: width - 250 - r3 * 300,
    cy: height - 200 - r4 * 200,
    rx: 250 + r1 * 200,
    ry: 200 + r2 * 200,
  };

  const grainOpacity = 0.06;
  const stripes: string[] = [];
  const stripeCount = 7;
  for (let i = 0; i < stripeCount; i++) {
    const y = (height / stripeCount) * i + r2 * 30;
    const w = 80 + ((r3 + i * 0.13) % 1) * 300;
    const x = ((r1 + i * 0.21) % 1) * (width - w);
    stripes.push(
      `<rect x="${x}" y="${y}" width="${w}" height="6" fill="${c3}" opacity="0.18" rx="3" />`
    );
  }

  const label = type === "A" ? "PŘÍLEŽITOST · A" : "TREND · B";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${c2}" stop-opacity="0.85" />
      <stop offset="100%" stop-color="${c2}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${c3}" stop-opacity="0.55" />
      <stop offset="100%" stop-color="${c3}" stop-opacity="0" />
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${Math.floor(r1 * 1000)}" />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${grainOpacity} 0" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <ellipse cx="${blob1.cx}" cy="${blob1.cy}" rx="${blob1.rx}" ry="${blob1.ry}" fill="url(#glow1)" />
  <ellipse cx="${blob2.cx}" cy="${blob2.cy}" rx="${blob2.rx}" ry="${blob2.ry}" fill="url(#glow2)" />
  ${stripes.join("\n  ")}
  <rect width="${width}" height="${height}" filter="url(#grain)" />
  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
    <text x="60" y="80" font-size="20" font-weight="700" letter-spacing="3" fill="${c3}" opacity="0.85">${label}</text>
  </g>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
