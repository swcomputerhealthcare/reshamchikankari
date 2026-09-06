import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/validation/env";
import * as auth from "./schema/auth";
import * as catalog from "./schema/catalog";
import * as cart from "./schema/cart";
import * as wishlist from "./schema/wishlist";
import * as coupon from "./schema/coupon";
import * as order from "./schema/order";
import * as payment from "./schema/payment";
import * as inventory from "./schema/inventory";
import * as wallet from "./schema/wallet";
import * as review from "./schema/review";
import * as refund from "./schema/refund";
import * as subscriber from "./schema/subscriber";
import * as content from "./schema/content";
import * as audit from "./schema/audit";

const schema = {
  ...auth,
  ...catalog,
  ...cart,
  ...wishlist,
  ...coupon,
  ...order,
  ...payment,
  ...inventory,
  ...wallet,
  ...review,
  ...refund,
  ...subscriber,
  ...content,
  ...audit,
};


const connectionString = (env.DATABASE_URL || "").replace(/['"]/g, "").trim();
const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const client =
  globalForDb.conn ??
  postgres(connectionString, {
    prepare: false,
    ssl: isLocal ? false : "require",
    max: isLocal ? 10 : 5,
    idle_timeout: 10,
    connect_timeout: 15,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
