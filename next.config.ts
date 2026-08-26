import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Required so the pre-existing LotusJourney motif can keep serving the brand
    // lotus vector (/images/lotus2.svg) through next/image. The footer lockup
    // passes `unoptimized` and does not depend on this flag.
    // contentDispositionType "attachment" keeps any SVG from being rendered inline
    // as a document, which is the XSS vector this flag otherwise opens up.
    // NOTE: the flag is global, so it also applies to the remote pattern below —
    // an SVG proxied from that host would be served from our own origin. If
    // LotusJourney is ever switched to `unoptimized` too, remove both lines.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
