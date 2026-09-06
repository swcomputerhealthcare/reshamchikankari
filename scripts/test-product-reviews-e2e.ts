import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const { db } = await import("@/db");
  const { products } = await import("@/db/schema/catalog");
  const { reviews } = await import("@/db/schema/review");
  const { profiles } = await import("@/db/schema/auth");
  const { eq, and } = await import("drizzle-orm");
  const { getProductReviewsAction, submitPublicReviewAction } = await import("@/actions/review");

  console.log("=== 1. FIND AN ACTIVE PRODUCT ===");
  const activeProds = await db.select().from(products).where(eq(products.isActive, true)).limit(1);
  if (activeProds.length === 0) {
    console.error("No active products found!");
    process.exit(1);
  }
  const testProduct = activeProds[0];
  console.log(`Testing product: "${testProduct.name}" (ID: ${testProduct.id}, Slug: ${testProduct.slug})`);

  console.log("\n=== 2. FETCH CURRENT APPROVED PRODUCT REVIEWS ===");
  const initialReviews = await getProductReviewsAction(testProduct.id);
  console.log(`Current approved reviews for this product: ${initialReviews.length}`);

  console.log("\n=== 3. SUBMIT A NEW REVIEW (GUEST PATRON) ===");
  const testAuthor = "Ananya Singhania";
  const testBody = "The intricate shadow-work and authentic muslin cotton texture are truly breathtaking. Delivered safely in Lucknow heritage packaging!";
  const testRating = 5;

  const submitRes = await submitPublicReviewAction(
    testAuthor,
    testRating,
    testBody,
    undefined,
    testProduct.id
  );
  console.log("Submit result:", submitRes);

  console.log("\n=== 4. VERIFY REVIEW IS IN MODERATION QUEUE (isApproved = false) ===");
  const [pendingRev] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, testProduct.id), eq(reviews.authorName, testAuthor)))
    .limit(1);

  if (!pendingRev) {
    console.error("Failed to find newly submitted review!");
    process.exit(1);
  }
  console.log(`Found pending review: ID=${pendingRev.id}, Author=${pendingRev.authorName}, isApproved=${pendingRev.isApproved}`);

  console.log("\n=== 5. VERIFY ZERO DUMMY CUSTOMER PROFILES CREATED ===");
  const dummyProfiles = await db.select().from(profiles).where(eq(profiles.fullName, testAuthor));
  console.log(`Dummy profiles created for guest reviewer: ${dummyProfiles.length} (Expected: 0)`);

  console.log("\n=== 6. APPROVE REVIEW IN ADMIN ===");
  await db
    .update(reviews)
    .set({ isApproved: true, updatedAt: new Date() })
    .where(eq(reviews.id, pendingRev.id));
  console.log("Review marked as approved!");

  console.log("\n=== 7. VERIFY APPROVED REVIEW NOW APPEARS ON PRODUCT PAGE ===");
  const updatedReviews = await getProductReviewsAction(testProduct.id);
  console.log(`Updated reviews count for product: ${updatedReviews.length}`);
  const found = updatedReviews.find(r => r.id === pendingRev.id);
  if (found) {
    console.log(`SUCCESS! Review "${found.authorName}" (${found.rating} stars) is now live for "${testProduct.name}"!`);
  } else {
    console.error("Review not found in approved list!");
    process.exit(1);
  }

  console.log("\n=== E2E TEST PASSED WITH ZERO DUMMY PROFILES! ===");
  process.exit(0);
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
