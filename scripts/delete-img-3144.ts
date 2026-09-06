import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=== Removing IMG_3144.JPG from database and filesystem ===");

  // 1. Delete physical file
  const filePath = path.join(process.cwd(), "public/images/reshamchikankari/New folder 9/IMG_3144.JPG");
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("✓ Physical file deleted:", filePath);
  } else {
    console.log("- Physical file does not exist or already removed:", filePath);
  }

  // 2. Check and delete from product_images table in DB
  try {
    const existing = await db.execute(
      sql`SELECT id, product_id, is_primary FROM product_images WHERE image_url LIKE '%IMG_3144.JPG%' OR url LIKE '%IMG_3144.JPG%'`
    );
    console.log(`Found ${existing.length} matching rows in product_images.`);

    if (existing.length > 0) {
      await db.execute(
        sql`DELETE FROM product_images WHERE image_url LIKE '%IMG_3144.JPG%' OR url LIKE '%IMG_3144.JPG%'`
      );
      console.log("✓ Deleted matching rows from product_images.");

      // Ensure the product has a primary image set
      const productId = existing[0].product_id;
      if (productId) {
        const remaining = await db.execute(
          sql`SELECT id, is_primary FROM product_images WHERE product_id = ${productId} ORDER BY sort_order ASC, created_at ASC LIMIT 1`
        );
        if (remaining.length > 0) {
          await db.execute(
            sql`UPDATE product_images SET is_primary = true WHERE id = ${remaining[0].id}`
          );
          console.log(`✓ Set primary image for product ${productId} to image id ${remaining[0].id}`);
        }
      }
    }
  } catch (dbErr) {
    console.warn("DB operation note:", (dbErr as Error).message);
  }

  console.log("=== Successfully finished cleaning up IMG_3144.JPG ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
