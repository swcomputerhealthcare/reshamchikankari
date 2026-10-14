import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().optional(),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().optional(),
  BETTER_AUTH_API_KEY: z.string().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),

  // Shiprocket Shipping
  SHIPROCKET_EMAIL: z.string().optional(),
  SHIPROCKET_PASSWORD: z.string().optional(),
  SHIPROCKET_PICKUP_LOCATION: z.string().optional(),
  SHIPROCKET_PICKUP_PINCODE: z.string().optional(),
  SHIPROCKET_WEBHOOK_SECRET: z.string().optional(),

  // Cloudflare
  CLOUDFLARE_API_TOKEN: z.string().optional(),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const isProd = process.env.NODE_ENV === "production";

export const env = {
  get DATABASE_URL() {
    return process.env.DATABASE_URL || "";
  },
  get NEXT_PUBLIC_SUPABASE_URL() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://woavdlhvmjikobigadqc.supabase.co";
  },
  get NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY() {
    return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ADKS42lpLMQX__UratAPsg_8jhAD-ND";
  },
  get SUPABASE_SECRET_KEY() {
    return process.env.SUPABASE_SECRET_KEY || "";
  },
  get BETTER_AUTH_SECRET() {
    return process.env.BETTER_AUTH_SECRET || (isProd ? "" : "dummy_secret_32_chars_long_minimum");
  },
  get BETTER_AUTH_URL() {
    return process.env.BETTER_AUTH_URL || (isProd ? "https://www.reshamchikankari.com" : "http://localhost:3000");
  },
  get BETTER_AUTH_API_KEY() {
    return process.env.BETTER_AUTH_API_KEY || "";
  },
  get RAZORPAY_KEY_ID() {
    return process.env.RAZORPAY_KEY_ID || (isProd ? "" : "rzp_test_placeholder");
  },
  get RAZORPAY_KEY_SECRET() {
    return process.env.RAZORPAY_KEY_SECRET || (isProd ? "" : "placeholder_secret");
  },
  get RAZORPAY_WEBHOOK_SECRET() {
    return process.env.RAZORPAY_WEBHOOK_SECRET || "";
  },
  get NEXT_PUBLIC_RAZORPAY_KEY_ID() {
    return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || (isProd ? "" : "rzp_test_placeholder");
  },
  get CLOUDINARY_CLOUD_NAME() {
    return process.env.CLOUDINARY_CLOUD_NAME || "";
  },
  get CLOUDINARY_API_KEY() {
    return process.env.CLOUDINARY_API_KEY || "";
  },
  get CLOUDINARY_API_SECRET() {
    return process.env.CLOUDINARY_API_SECRET || "";
  },
  get RESEND_API_KEY() {
    return process.env.RESEND_API_KEY || "";
  },
  get SHIPROCKET_EMAIL() {
    return process.env.SHIPROCKET_EMAIL || "";
  },
  get SHIPROCKET_PASSWORD() {
    return process.env.SHIPROCKET_PASSWORD || "";
  },
  get SHIPROCKET_PICKUP_LOCATION() {
    return process.env.SHIPROCKET_PICKUP_LOCATION || "Home";
  },
  get SHIPROCKET_PICKUP_PINCODE() {
    return process.env.SHIPROCKET_PICKUP_PINCODE || "110008";
  },
  get SHIPROCKET_WEBHOOK_SECRET() {
    return process.env.SHIPROCKET_WEBHOOK_SECRET || "";
  },
  get CLOUDFLARE_API_TOKEN() {
    return process.env.CLOUDFLARE_API_TOKEN || "";
  },
  get NODE_ENV() {
    return (process.env.NODE_ENV || "development") as "development" | "production" | "test";
  },
};

export type EnvType = z.infer<typeof envSchema>;
