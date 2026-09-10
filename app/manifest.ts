import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Resham Chikankari — Authentic Lucknowi Handcrafted Kurtis",
    short_name: "Resham Chikankari",
    description: "Discover authentic GI-certified Lucknowi Chikankari kurtis, suits, and ethnic wear handcrafted by master women artisans in Lucknow.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF9F4",
    theme_color: "#7C7A5A",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48 32x32 16x16",
        type: "image/x-icon",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
