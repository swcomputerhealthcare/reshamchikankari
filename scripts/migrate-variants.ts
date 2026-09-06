import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    ALTER TABLE product_variants 
    ADD COLUMN IF NOT EXISTS color_name text,
    ADD COLUMN IF NOT EXISTS color_code text,
    ADD COLUMN IF NOT EXISTS size text,
    ADD COLUMN IF NOT EXISTS image_id text;
  `);
  console.log("Successfully migrated product_variants columns!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
