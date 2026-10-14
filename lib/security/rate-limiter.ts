import { db } from "@/db";
import { securityRateLimits } from "@/db/schema/coupon";
import { eq, and, sql } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/utils";

export interface RateLimitOptions {
  maxHits: number;
  windowSeconds: number;
  blockDurationSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingHits: number;
  retryAfterSeconds?: number;
}

/**
 * Shared database-backed rate limiter.
 * Operates across all serverless and node instances to prevent brute-force attacks.
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  if (!isDatabaseConfigured() || !identifier) {
    return { allowed: true, remainingHits: options.maxHits };
  }

  const { maxHits, windowSeconds, blockDurationSeconds } = options;
  const now = new Date();

  try {
    const [existing] = await db
      .select()
      .from(securityRateLimits)
      .where(
        and(
          eq(securityRateLimits.identifier, identifier),
          eq(securityRateLimits.action, action)
        )
      )
      .limit(1);

    if (existing) {
      // 1. Check if currently blocked
      if (existing.blockedUntil && new Date(existing.blockedUntil).getTime() > now.getTime()) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((new Date(existing.blockedUntil).getTime() - now.getTime()) / 1000)
        );
        return {
          allowed: false,
          remainingHits: 0,
          retryAfterSeconds,
        };
      }

      // 2. Check if sliding window expired
      const windowStartMs = new Date(existing.firstHitAt).getTime();
      const elapsedSeconds = (now.getTime() - windowStartMs) / 1000;

      if (elapsedSeconds > windowSeconds) {
        // Reset window
        await db
          .update(securityRateLimits)
          .set({
            hitCount: 1,
            firstHitAt: now,
            lastHitAt: now,
            blockedUntil: null,
          })
          .where(eq(securityRateLimits.id, existing.id));

        return {
          allowed: true,
          remainingHits: maxHits - 1,
        };
      }

      // 3. Increment within current window
      const newCount = existing.hitCount + 1;
      const isNowBlocked = newCount >= maxHits;
      const blockUntilTime = isNowBlocked
        ? new Date(now.getTime() + blockDurationSeconds * 1000)
        : null;

      await db
        .update(securityRateLimits)
        .set({
          hitCount: newCount,
          lastHitAt: now,
          blockedUntil: blockUntilTime,
        })
        .where(eq(securityRateLimits.id, existing.id));

      if (isNowBlocked) {
        return {
          allowed: false,
          remainingHits: 0,
          retryAfterSeconds: blockDurationSeconds,
        };
      }

      return {
        allowed: true,
        remainingHits: Math.max(0, maxHits - newCount),
      };
    }

    // 4. Create new record
    const id = `rl_${Math.random().toString(36).substring(2, 11)}`;
    await db.insert(securityRateLimits).values({
      id,
      identifier,
      action,
      hitCount: 1,
      firstHitAt: now,
      lastHitAt: now,
      blockedUntil: null,
      createdAt: now,
    });

    return {
      allowed: true,
      remainingHits: maxHits - 1,
    };
  } catch (err) {
    console.warn("Rate limit check error:", err);
    // Fail open to avoid blocking legitimate users on database glitch
    return { allowed: true, remainingHits: 1 };
  }
}

/**
 * Reset rate limit counter upon successful validation.
 */
export async function resetRateLimit(identifier: string, action: string): Promise<void> {
  if (!isDatabaseConfigured() || !identifier) return;
  try {
    await db
      .delete(securityRateLimits)
      .where(
        and(
          eq(securityRateLimits.identifier, identifier),
          eq(securityRateLimits.action, action)
        )
      );
  } catch (e) {
    console.warn("Could not reset rate limit:", e);
  }
}
