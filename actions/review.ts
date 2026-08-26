'use server';

import { db } from "@/db";
import { reviews } from "@/db/schema/review";
import { orders, orderItems } from "@/db/schema/order";
import { getCurrentUser } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";

export async function submitReviewAction(
  productId: string,
  rating: number,
  title: string,
  body: string,
  orderId?: string
) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Please log in to submit a review." };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5 stars." };
  }

  if (!body || body.trim().length < 5) {
    return { success: false, error: "Please write a review body (minimum 5 characters)." };
  }

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      // Check if user already reviewed this product
      const existing = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.userId, user.id), eq(reviews.productId, productId)))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, error: "You have already submitted a review for this product." };
      }

      // Verify if purchase is verified
      let isVerifiedPurchase = false;
      let finalOrderId: string | null = null;

      if (orderId) {
        const orderResult = await db.query.orders.findFirst({
          where: and(eq(orders.id, orderId), eq(orders.userId, user.id)),
          with: {
            items: true
          }
        });

        if (orderResult) {
          const hasProduct = orderResult.items.some(item => item.productId === productId);
          if (hasProduct) {
            isVerifiedPurchase = true;
            finalOrderId = orderId;
          }
        }
      } else {
        // Look up any successful order by this user containing the product
        const purchase = await db
          .select()
          .from(orders)
          .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
          .where(and(
            eq(orders.userId, user.id),
            eq(orders.paymentStatus, "PAID"),
            eq(orderItems.productId, productId)
          ))
          .limit(1);

        if (purchase.length > 0) {
          isVerifiedPurchase = true;
          finalOrderId = purchase[0].orders.id;
        }
      }

      await db.insert(reviews).values({
        id: `rev_${Math.random().toString(36).substring(2, 11)}`,
        productId,
        userId: user.id,
        orderId: finalOrderId,
        rating,
        title: title || null,
        body,
        isVerifiedPurchase,
        isApproved: false, // Moderated by default
      });

      return { success: true, message: "Thank you! Your review has been submitted for moderation." };
    } catch (e) {
      console.error("Failed to submit review:", e);
      return { success: false, error: "Failed to submit review. Please try again later." };
    }
  } else {
    console.log("Offline Mode: Submitted review", { productId, rating, title, body });
    return { success: true, message: "Mock Mode: Review submitted successfully!" };
  }
}

export async function moderateReviewAction(reviewId: string, isApproved: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access. Admins only." };
  }

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      await db
        .update(reviews)
        .set({ isApproved, updatedAt: new Date() })
        .where(eq(reviews.id, reviewId));
      
      return { success: true, message: `Review has been ${isApproved ? "approved" : "rejected"} successfully.` };
    } catch (e) {
      console.error("Failed to moderate review:", e);
      return { success: false, error: "Failed to moderate review." };
    }
  } else {
    return { success: true, message: `Mock Mode: Review ${reviewId} moderate set to ${isApproved}.` };
  }
}

export async function adminCreateReviewAction(
  userId: string,
  productId: string,
  rating: number,
  title: string,
  body: string,
  isVerifiedPurchase: boolean
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access. Admins only." };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5." };
  }

  if (!body || body.trim().length < 5) {
    return { success: false, error: "Please write a review body." };
  }

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      const id = `rev_${Math.random().toString(36).substring(2, 11)}`;
      await db.insert(reviews).values({
        id,
        productId,
        userId,
        rating,
        title: title || null,
        body,
        isVerifiedPurchase,
        isApproved: true, // Auto-approve admin imported reviews
      });

      const { revalidatePath } = await import("next/cache");
      revalidatePath("/admin/reviews");
      revalidatePath("/shop");
      return { success: true };
    } catch (e: any) {
      console.error("Admin create review failed:", e);
      return { success: false, error: e.message || "Failed to create review." };
    }
  } else {
    return { success: true, message: "Offline simulated review creation." };
  }
}

export async function deleteReviewAction(id: string) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access." };
  }

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      await db.delete(reviews).where(eq(reviews.id, id));
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/admin/reviews");
      revalidatePath("/shop");
      return { success: true };
    } catch (e: any) {
      console.error("Delete review failed:", e);
      return { success: false, error: "Failed to delete review." };
    }
  } else {
    return { success: true };
  }
}

