import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "postgres://localhost:5432/dummy",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://woavdlhvmjikobigadqc.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ADKS42lpLMQX__UratAPsg_8jhAD-ND",
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || "sb_secret_dummy",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "dummy_secret_32_chars_long_minimum",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "dummy_key",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "dummy_secret",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "dummy",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "dummy",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "dummy",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "dummy",
  NODE_ENV: (process.env.NODE_ENV || "development") as "development" | "production" | "test",
};

export type EnvType = z.infer<typeof envSchema>;
