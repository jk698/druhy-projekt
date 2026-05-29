/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: false,
  },
  // Soukromý web — noindex na úrovni HTTP hlavičky pro všechny odpovědi
  // (drží i pro RSS a přímé odkazy, ne jen pro HTML s meta tagem).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
