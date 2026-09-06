import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema/content";
import { eq } from "drizzle-orm";

export const getCachedSiteSettings = unstable_cache(
  async () => {
    try {
      const hasDb = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
      if (!hasDb) return null;

      const res = await db.query.siteSettings.findFirst({
        where: eq(siteSettings.id, "global"),
      });
      return res || null;
    } catch (err) {
      console.error("Failed to query site settings:", err);
      return null;
    }
  },
  ["global-site-settings"],
  {
    tags: ["site-settings"],
    revalidate: 3600, // Revalidate in background every hour or immediately on mutation
  }
);
