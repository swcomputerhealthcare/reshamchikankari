import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    ALTER TABLE reviews ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_name text;
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_city text;
  `);
  console.log("Successfully made reviews.user_id nullable and added author_name & author_city!");
  process.exit(0);
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
