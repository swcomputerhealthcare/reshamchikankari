import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  const res = await db.execute(
    sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'`
  );
  console.log("Columns in products table:", res.map((r: any) => r.column_name));
  process.exit(0);
}

main().catch((err) => {
  console.error("Error inspecting products columns:", err);
  process.exit(1);
});
