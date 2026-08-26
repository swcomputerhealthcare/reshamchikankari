'use server';

import { db } from "@/db";
import { subscribers } from "@/db/schema/subscriber";
import { eq } from "drizzle-orm";

export async function subscribeToNewsletter(email: string) {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      // Check if already exists
      const existing = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, email))
        .limit(1);

      if (existing.length > 0) {
        if (existing[0].isActive) {
          return { success: true, message: "You are already subscribed to our newsletter!" };
        } else {
          // Re-activate subscription
          await db
            .update(subscribers)
            .set({ isActive: true, unsubscribedAt: null, updatedAt: new Date() })
            .where(eq(subscribers.email, email));
          return { success: true, message: "Welcome back! Your subscription has been reactivated." };
        }
      }

      // Insert new subscriber
      await db.insert(subscribers).values({
        id: `sub_${Math.random().toString(36).substring(2, 11)}`,
        email,
        isActive: true,
      });

      return { success: true, message: "Thank you for subscribing to our newsletter!" };
    } catch (e) {
      console.error("Subscription failed:", e);
      return { success: false, error: "Failed to process subscription. Please try again later." };
    }
  } else {
    console.log("Offline Mode: Subscribed newsletter", email);
    return { success: true, message: "Mock Mode: Thank you for subscribing!" };
  }
}
