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


const client = postgres(env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
