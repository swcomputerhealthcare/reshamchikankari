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


type DbClient = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  db: DbClient | undefined;
};

// Fallback dummy connection string for build-time static route collection when Vercel env is unpopulated
const MOCK_BUILD_CONNECTION = "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

function getDb(): DbClient {
  if (globalForDb.db) {
    return globalForDb.db;
  }

  const rawUrl = process.env.DATABASE_URL || env.DATABASE_URL || "";
  let connectionString = rawUrl.replace(/['"]/g, "").trim();

  const isPlaceholder =
    !connectionString ||
    connectionString.includes("[YOUR-PROJECT-REF]") ||
    connectionString.includes("YOUR-PROJECT-REF") ||
    connectionString.includes("[YOUR-PASSWORD]");

  if (isPlaceholder) {
    // If during Next.js build / page data collection, use dummy connection to allow build to complete cleanly
    if (
      process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.CI ||
      process.env.VERCEL ||
      process.env.NODE_ENV === "production"
    ) {
      console.warn("⚠️ DATABASE_URL contains placeholder values during build phase. Using dummy connection for static route collection.");
      connectionString = MOCK_BUILD_CONNECTION;
    } else {
      throw new Error(
        "CRITICAL: DATABASE_URL is not properly configured in production environment (contains placeholder YOUR-PROJECT-REF or YOUR-PASSWORD). Please update your production environment variables in Vercel/hosting dashboard with valid Supabase credentials."
      );
    }
  }

  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

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

  const drizzleDb = drizzle(client, { schema });
  globalForDb.db = drizzleDb;
  return drizzleDb;
}

export const db: DbClient = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});
