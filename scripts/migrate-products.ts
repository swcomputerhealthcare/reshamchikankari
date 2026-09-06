import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS weight_kg real DEFAULT 0.5,
    ADD COLUMN IF NOT EXISTS length_cm integer DEFAULT 30,
    ADD COLUMN IF NOT EXISTS breadth_cm integer DEFAULT 25,
    ADD COLUMN IF NOT EXISTS height_cm integer DEFAULT 5,
    ADD COLUMN IF NOT EXISTS hsn_code text DEFAULT '6204';

    ALTER TABLE product_images
    ADD COLUMN IF NOT EXISTS color_name text;
  `);
  console.log("Successfully migrated products and product_images columns!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
