'use server';

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { profiles } from "@/db/schema/auth";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://woavdlhvmjikobigadqc.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_ADKS42lpLMQX__UratAPsg_8jhAD-ND";

/**
 * Dispatch an email OTP verification code to the customer.
 * Works seamlessly for both existing and brand-new customers without requiring passwords.
 */
export async function sendOtpAction(
  identifier: string,
  fullName?: string
): Promise<{ success: boolean; message?: string; error?: string; targetEmail?: string }> {
  try {
    const raw = (identifier || "").trim();
    if (!raw) {
      return { success: false, error: "Please enter your email address or mobile number." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let cleanEmail: string | null = null;
    let maskedEmail: string | null = null;

    if (raw.includes("@")) {
      cleanEmail = raw.toLowerCase();
      if (!emailRegex.test(cleanEmail)) {
        return { success: false, error: "Please enter a valid email address." };
      }
    } else {
      // Mobile number input: extract 10 digits
      const digitsOnly = raw.replace(/\D/g, "");
      const cleanPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
      if (cleanPhone.length < 10) {
        return { success: false, error: "Please enter a valid 10-digit mobile number or email address." };
      }

      // Look up associated email in previous orders or profiles
      try {
        const { orders } = await import("@/db/schema/order");
        const { profiles } = await import("@/db/schema/auth");
        const { sql, desc } = await import("drizzle-orm");

        // 1. Check profiles table
        const profile = await db.query.profiles.findFirst({
          where: sql`RIGHT(REGEXP_REPLACE(${profiles.phone}, '[^0-9]', '', 'g'), 10) = ${cleanPhone}`,
        });

        if (profile?.email && emailRegex.test(profile.email)) {
          cleanEmail = profile.email.toLowerCase();
        } else {
          // 2. Check orders shipping address snapshot
          const [orderWithPhone] = await db
            .select({
              shippingAddressSnapshot: orders.shippingAddressSnapshot,
            })
            .from(orders)
            .where(
              sql`RIGHT(REGEXP_REPLACE(shipping_address_snapshot->>'phone', '[^0-9]', '', 'g'), 10) = ${cleanPhone}`
            )
            .orderBy(desc(orders.createdAt))
            .limit(1);

          const snap = orderWithPhone?.shippingAddressSnapshot as any;
          if (snap?.email && emailRegex.test(snap.email)) {
            cleanEmail = snap.email.toLowerCase();
          }
        }

        if (!cleanEmail) {
          return {
            success: false,
            error: "No orders found for this mobile number. Please enter the email address used during checkout.",
          };
        }

        // Mask email for privacy: e.g. "priya.sharma@gmail.com" -> "p***a@gmail.com"
        const [userPart, domainPart] = cleanEmail.split("@");
        if (userPart.length <= 2) {
          maskedEmail = `${userPart[0]}***@${domainPart}`;
        } else {
          maskedEmail = `${userPart[0]}***${userPart[userPart.length - 1]}@${domainPart}`;
        }
      } catch (dbErr) {
        console.warn("Phone lookup warning in sendOtpAction:", dbErr);
        return {
          success: false,
          error: "Could not find account for this phone. Please enter your email address.",
        };
      }
    }

    const supabase = createSupabaseJsClient(SUPABASE_URL, SUPABASE_KEY);

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: fullName?.trim() || cleanEmail.split("@")[0] || "Valued Patron",
        },
      },
    });

    if (error) {
      console.error("sendOtpAction Supabase error:", error);
      return { success: false, error: error.message || "Failed to send verification code." };
    }

    const message = maskedEmail
      ? `Mobile number recognized! A 6-digit verification code has been dispatched to your associated email (${maskedEmail}). Please check your inbox.`
      : `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox.`;

    return {
      success: true,
      message,
      targetEmail: cleanEmail,
    };
  } catch (err: any) {
    console.error("sendOtpAction exception:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while sending the verification code.",
    };
  }
}

/**
 * Verify customer's 6-digit OTP code.
 * Establishes authenticated Supabase session in SSR cookies,
 * auto-upserts patron profile, and returns verified customer details.
 */
export async function verifyOtpAction(
  email: string,
  token: string,
  fullName?: string
): Promise<{
  success: boolean;
  user?: { id: string; email: string; name: string };
  session?: { access_token: string; refresh_token: string } | null;
  error?: string;
}> {
  try {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanToken = (token || "").trim().replace(/\D/g, "");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: "Please provide a valid email address." };
    }

    if (!cleanToken || cleanToken.length < 6) {
      return { success: false, error: "Please enter the complete 6-digit verification code." };
    }

    let cookieStore: any = null;
    try {
      cookieStore = await cookies();
    } catch {
      // Non-request contexts / tests
    }

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
      cookies: {
        getAll() {
          return cookieStore ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet) {
          if (!cookieStore) return;
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                path: options?.path ?? "/",
                sameSite: options?.sameSite ?? "lax",
                secure: process.env.NODE_ENV === "production",
              });
            });
          } catch (cErr) {
            console.warn("Could not set auth cookies in verifyOtpAction:", cErr);
          }
        },
      },
    });

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: "email",
    });

    if (error || !data?.user) {
      console.error("verifyOtpAction error:", error);
      const isExpired = error?.message?.toLowerCase().includes("expired") || error?.message?.toLowerCase().includes("invalid");
      return {
        success: false,
        error: isExpired
          ? "The verification code is invalid or has expired. Please request a new code."
          : (error?.message || "Failed to verify code."),
      };
    }

    const verifiedUser = data.user;
    const patronName =
      fullName?.trim() ||
      (verifiedUser.user_metadata?.full_name as string) ||
      cleanEmail.split("@")[0] ||
      "Valued Patron";

    // Auto-upsert patron profile row into database
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(verifiedUser.id);
    if (isUuid) {
      try {
        await db
          .insert(profiles)
          .values({
            id: verifiedUser.id,
            fullName: patronName,
            email: verifiedUser.email || cleanEmail,
            role: "CUSTOMER",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: profiles.id,
            set: {
              fullName: patronName,
              email: verifiedUser.email || cleanEmail,
              updatedAt: new Date(),
            },
          });
      } catch (dbErr) {
        console.warn("Could not auto-upsert patron profile in verifyOtpAction:", dbErr);
      }
    }

    // Safely associate any historical guest orders belonging to this verified identity
    try {
      const { claimGuestOrdersForUser } = await import("@/lib/orders/claim");
      await claimGuestOrdersForUser(verifiedUser.id, verifiedUser.email || cleanEmail);
    } catch (claimErr) {
      console.warn("Could not claim historical guest orders during OTP verification:", claimErr);
    }

    return {
      success: true,
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email || cleanEmail,
        name: patronName,
      },
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }
        : null,
    };
  } catch (err: any) {
    console.error("verifyOtpAction exception:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred during OTP verification.",
    };
  }
}
