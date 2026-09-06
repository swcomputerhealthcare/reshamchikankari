import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS fulfillment_status text DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS shiprocket_order_id text,
    ADD COLUMN IF NOT EXISTS shiprocket_shipment_id text,
    ADD COLUMN IF NOT EXISTS awb_code text,
    ADD COLUMN IF NOT EXISTS courier_name text,
    ADD COLUMN IF NOT EXISTS courier_company_id integer,
    ADD COLUMN IF NOT EXISTS tracking_url text,
    ADD COLUMN IF NOT EXISTS pickup_scheduled_at timestamp,
    ADD COLUMN IF NOT EXISTS shipped_at timestamp,
    ADD COLUMN IF NOT EXISTS delivered_at timestamp,
    ADD COLUMN IF NOT EXISTS cancelled_at timestamp,
    ADD COLUMN IF NOT EXISTS last_tracking_update timestamp,
    ADD COLUMN IF NOT EXISTS shipping_error text,
    ADD COLUMN IF NOT EXISTS shipping_created_at timestamp;

    CREATE TABLE IF NOT EXISTS order_timeline (
      id text PRIMARY KEY,
      order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status text NOT NULL,
      message text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
  console.log("Successfully migrated orders and order_timeline columns!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
