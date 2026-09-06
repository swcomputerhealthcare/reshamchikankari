import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  const res = await db.execute(
    sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'`
  );
  console.log("Columns in orders table:", res.map((r: any) => r.column_name));
  process.exit(0);
}

main().catch((err) => {
  console.error("Error inspecting orders columns:", err);
  process.exit(1);
});
