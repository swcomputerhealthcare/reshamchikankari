import postgres from "postgres";

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes("[YOUR-PASSWORD]")) {
    console.log("No valid DATABASE_URL found. Skipping DB schema alter.");
    process.exit(0);
  }

  const sql = postgres(dbUrl);

  try {
    console.log("Adding variant & image columns to database if missing...");

    await sql`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color_name text;`;
    await sql`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color_code text;`;
    await sql`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS size text;`;
    await sql`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS image_id text;`;
    await sql`ALTER TABLE product_images ADD COLUMN IF NOT EXISTS color_name text;`;

    console.log("✅ Successfully altered DB schema tables (product_variants & product_images)!");
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
