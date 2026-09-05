import Razorpay from "razorpay";
import { env } from "@/lib/validation/env";

const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID || "rzp_live_TYIGUQfADESI9t";
const key_secret = process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET || "S6foaXaoR516ySbyqwbmrR3c";

export const razorpay = new Razorpay({
  key_id,
  key_secret,
});

export { key_id as RAZORPAY_KEY_ID, key_secret as RAZORPAY_KEY_SECRET };
