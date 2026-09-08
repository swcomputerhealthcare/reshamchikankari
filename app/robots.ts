import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.reshamchikankari.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/shop/*",
          "/product/*",
          "/about",
          "/contact",
          "/care",
          "/faq",
          "/terms",
          "/privacy",
          "/shipping",
          "/patron-voices",
          "/search",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/account",
          "/account/*",
          "/api/*",
          "/auth/*",
          "/checkout",
          "/checkout/*",
          "/forgot-password",
          "/unauthorized",
        ],
      },
      {
        userAgent: ["Googlebot", "Bingbot", "Applebot", "DuckDuckBot"],
        allow: "/",
        disallow: [
          "/admin/*",
          "/account/*",
          "/api/*",
          "/auth/*",
          "/checkout/*",
        ],
      },
      {
        // GEO & AI Search crawlers (Perplexity, ChatGPT, Claude, Gemini)
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: ["/", "/llms.txt", "/llms-full.txt", "/shop/*", "/product/*", "/about"],
        disallow: ["/admin/*", "/account/*", "/checkout/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
