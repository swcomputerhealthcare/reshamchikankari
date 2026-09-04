import { createSupabaseContext } from "@/lib/supabase/context";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profiles } from "@/db/schema/auth";
import { cache } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  createdAt?: string | Date;
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const { data: ctx, error } = await createSupabaseContext({ auth: "user" });
  if (error || !ctx || !ctx.userClaims) {
    // In development mode, only provide fallback Admin if ALLOW_DEV_AUTH_BYPASS is explicitly set to "true"
    if (process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_AUTH_BYPASS === "true") {
      return {
        id: "usr_admin_dev",
        name: "Resham Admin (Dev Mode)",
        email: "admin@reshamchikankari.com",
        role: "ADMIN",
        image: null,
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  }

  const { id: userId, email, userMetadata } = ctx.userClaims;
  const adminEmails = (process.env.ADMIN_EMAILS || "mr.patil.satu@gmail.com").split(",").map((e) => e.trim().toLowerCase());
  const userEmail = (email || "").toLowerCase();
  const isAdminEmail = adminEmails.includes(userEmail);

  // Query profiles table using Drizzle with a try-catch to prevent crashing on missing tables
  let profile = null;
  try {
    profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });
  } catch (dbError) {
    console.error("Warning: profiles table query failed. Ensure SQL schema is applied.", dbError);
  }

  if (!profile) {
    const resolvedRole = isAdminEmail ? "ADMIN" : "CUSTOMER";
    const fullName = (userMetadata?.full_name as string) || (userMetadata?.name as string) || email || "Valued Customer";
    const avatarUrl = (userMetadata?.avatar_url as string) || null;

    // Automatically upsert missing profile row to satisfy foreign key constraints across wishlists, orders, and wallets
    try {
      await db.insert(profiles).values({
        id: userId,
        fullName,
        email: email || `${userId}@user.com`,
        avatarUrl,
        role: resolvedRole,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();
    } catch (insertErr) {
      console.warn("Could not auto-create profile row:", insertErr);
    }

    return {
      id: userId,
      name: fullName,
      email: email || "",
      role: resolvedRole,
      image: avatarUrl,
      createdAt: new Date().toISOString(),
    };
  }

  const resolvedRole = (isAdminEmail || profile.role === "ADMIN") ? "ADMIN" : "CUSTOMER";

  return {
    id: profile.id,
    name: profile.fullName || "",
    email: profile.email || "",
    role: resolvedRole,
    image: profile.avatarUrl || null,
    createdAt: profile.createdAt,
  };
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const headerList = await headers();
    const currentUrl = headerList.get("x-url") || "/account";
    redirect(`/login?callbackURL=${encodeURIComponent(currentUrl)}`);
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
  return user;
}

