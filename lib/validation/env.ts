import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().min(1),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),

  // Better Auth (Optionalized)
  BETTER_AUTH_SECRET: z.string().min(1).optional(),
  BETTER_AUTH_URL: z.string().url().min(1).optional(),

  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

let parsedEnv: z.infer<typeof envSchema>;

if (isBuild || process.env.NODE_ENV === "development") {
  // During static builds or local development, missing env variables are allowed as warnings
  const schemaForBuild = envSchema.partial();
  const parsed = schemaForBuild.safeParse(process.env);
  if (!parsed.success) {
    console.warn("⚠️ Warning: Missing environment variables during build/dev:", parsed.error.format());
  }
  parsedEnv = {
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
} else {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Invalid environment variables. Please check your .env file.");
  }
  parsedEnv = parsed.data;
}

export const env = parsedEnv;
export type EnvType = z.infer<typeof envSchema>;
