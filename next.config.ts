import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 430, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/collections",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/shop/everyday-cotton",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/shop/festive-georgette",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/shop/the-pastel-edit",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/shop/pastel-edit",
        destination: "/shop",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
