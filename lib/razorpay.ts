import Razorpay from "razorpay";
import { env } from "@/lib/validation/env";

const key_id = process.env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID || "rzp_test_TW3QQt1VzzNel6";
const key_secret = process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET || "n3El2db9w8KRICQLqXRdN41y";

export const razorpay = new Razorpay({
  key_id,
  key_secret,
});

export { key_id as RAZORPAY_KEY_ID, key_secret as RAZORPAY_KEY_SECRET };
