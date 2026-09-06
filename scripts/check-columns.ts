import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  const res = await db.execute(
    sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_variants'`
  );
  console.log("Columns in product_variants:", res);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error inspecting columns:", err);
  process.exit(1);
});
