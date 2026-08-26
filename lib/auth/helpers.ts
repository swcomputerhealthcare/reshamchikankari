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
    return null;
  }

  const { id: userId, email, userMetadata } = ctx.userClaims;

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
    const userEmail = email || "";
    const resolvedRole = userEmail === "mr.patil.satu@gmail.com" ? "ADMIN" : "CUSTOMER";
    return {
      id: userId,
      name: (userMetadata?.full_name as string) || (userMetadata?.name as string) || userEmail || "",
      email: userEmail,
      role: resolvedRole,
      image: (userMetadata?.avatar_url as string) || null,
      createdAt: new Date().toISOString(),
    };
  }

  const resolvedRole = (profile.email === "mr.patil.satu@gmail.com" || profile.role === "ADMIN") ? "ADMIN" : "CUSTOMER";

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

