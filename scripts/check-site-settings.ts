import { db } from "@/db";
import { siteSettings } from "@/db/schema/content";
import { eq } from "drizzle-orm";

async function main() {
  const row = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, "global"),
  });
  console.log("Current site_settings in DB:", row);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error checking site_settings:", err);
  process.exit(1);
});
