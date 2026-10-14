import Razorpay from "razorpay";
import { env } from "@/lib/validation/env";

const isProd = process.env.NODE_ENV === "production";

const key_id =
  process.env.RAZORPAY_KEY_ID ||
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  env.RAZORPAY_KEY_ID ||
  (isProd ? "" : "rzp_test_placeholder");

const key_secret =
  process.env.RAZORPAY_KEY_SECRET ||
  env.RAZORPAY_KEY_SECRET ||
  (isProd ? "" : "placeholder_secret");

if (isProd && (!key_id || !key_secret)) {
  console.error("Critical: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in production environment.");
}

export const razorpay = new Razorpay({
  key_id: key_id || "unconfigured_key",
  key_secret: key_secret || "unconfigured_secret",
});

export { key_id as RAZORPAY_KEY_ID, key_secret as RAZORPAY_KEY_SECRET };
