import { config } from "dotenv";
config();

import { db } from "../db";
import { products, productVariants } from "../db/schema/catalog";
import { siteSettings } from "../db/schema/content";
import { coupons } from "../db/schema/coupon";
import { adminActivities } from "../db/schema/audit";
import { orderItems } from "../db/schema/order";
import { eq, desc } from "drizzle-orm";
import { calculateProductPrice } from "../lib/promotions";
import { bulkUpdatePricesAction, updateProductVariantAction, deleteProductAction } from "../actions/catalog";
import { getPromotionCampaignAction, updatePromotionCampaignAction } from "../actions/promotions";
import { createCouponAction, deleteCouponAction } from "../actions/coupon";
import { addToCartAction } from "../actions/cart";

// Configure development admin bypass for script environment
(process.env as any).NODE_ENV = "development";
process.env.ALLOW_DEV_AUTH_BYPASS = "true";
process.env.ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";

async function runAdminE2ETests() {
  console.log("================================================================================");
  console.log("RESHAM CHIKANKARI — ADMIN OVERHAUL END-TO-END ACCEPTANCE SUITE");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 1: Canonical Price vs Promotional Price Isolation
  // -------------------------------------------------------------------------
  console.log("▶ Test 1: Canonical Selling Price & Active Promotion Separation");
  const allProds = await db.query.products.findMany({ limit: 100 });
  const testProd = allProds.find((p) => p.name.toUpperCase().includes("SPARKLE")) || allProds[0];

  if (!testProd) {
    console.error("Critical: No products found in database.");
    process.exit(1);
  }

  const canonicalPaise = testProd.pricePaise;
  assert(canonicalPaise === 269500, "Canonical database price for Chanderi Sparkle is ₹2,695 (269,500 paise)", `Got ${canonicalPaise}`);

  const promoBreakdown = calculateProductPrice(canonicalPaise);
  assert(promoBreakdown.canonicalPricePaise === 269500, "Canonical price preserved in pricing engine breakdown");
  assert(promoBreakdown.sellingPricePaise === 215600, "Navratri 20% price is calculated as ₹2,156 (215,600 paise)", `Got ${promoBreakdown.sellingPricePaise}`);
  assert(promoBreakdown.navratriDiscountPaise === 53900, "Navratri discount amount is exactly ₹539 (53,900 paise)");

  // -------------------------------------------------------------------------
  // TEST 2: Bulk Price Update Persistence
  // -------------------------------------------------------------------------
  console.log("\n▶ Test 2: Bulk Price Update Action & Audit Persistence");
  const originalPricePaise = testProd.pricePaise;
  const originalComparePaise = testProd.compareAtPricePaise;

  const testNewPricePaise = 279500; // ₹2,795
  const testNewComparePaise = 399500; // ₹3,995

  const bulkRes = await bulkUpdatePricesAction([
    {
      id: testProd.id,
      pricePaise: testNewPricePaise,
      compareAtPricePaise: testNewComparePaise,
    },
  ]);

  assert(bulkRes.success === true, "bulkUpdatePricesAction executed successfully");
  assert(bulkRes.successCount === 1, "Reported 1 successful price update");

  // Verify in PostgreSQL database
  const updatedProd = await db.query.products.findFirst({
    where: eq(products.id, testProd.id),
  });
  assert(updatedProd?.pricePaise === testNewPricePaise, "Updated price persisted to PostgreSQL database as ₹2,795");
  assert(updatedProd?.compareAtPricePaise === testNewComparePaise, "Updated MRP persisted to PostgreSQL database as ₹3,995");

  // Verify promotional price recalculated automatically on storefront
  const newPromoBreakdown = calculateProductPrice(updatedProd?.pricePaise || 0);
  assert(newPromoBreakdown.sellingPricePaise === Math.round(testNewPricePaise * 0.8), "New sale price reflects updated canonical price automatically (₹2,236)");

  // Restore baseline price
  await bulkUpdatePricesAction([
    {
      id: testProd.id,
      pricePaise: originalPricePaise,
      compareAtPricePaise: originalComparePaise,
    },
  ]);
  const restoredProd = await db.query.products.findFirst({
    where: eq(products.id, testProd.id),
  });
  assert(restoredProd?.pricePaise === originalPricePaise, "Baseline canonical price safely restored to ₹2,695");

  // -------------------------------------------------------------------------
  // TEST 3: Size Variant Out-of-Stock & Cart Enforcement
  // -------------------------------------------------------------------------
  console.log("\n▶ Test 3: Size Variant Out-of-Stock & Server-side Integrity");
  const testVariant = await db.query.productVariants.findFirst({
    where: eq(productVariants.productId, testProd.id),
  });

  if (!testVariant) {
    console.error("Critical: No variants found for Chanderi Sparkle.");
    process.exit(1);
  }

  const originalStock = testVariant.stock;
  const originalAvailable = testVariant.isAvailable;

  // Mark variant out of stock: stock = 0
  const oosRes = await updateProductVariantAction(testVariant.id, {
    stock: 0,
    isAvailable: false,
    sku: testVariant.sku,
  });
  assert(oosRes.success === true, "updateProductVariantAction executed successfully for stock = 0");

  // Check DB state
  const oosDbVariant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, testVariant.id),
  });
  assert(oosDbVariant?.stock === 0, "Database variant stock is 0");
  assert(oosDbVariant?.isAvailable === false, "Database variant isAvailable is false");

  // Attempt to add out-of-stock variant to cart
  const cartRes = await addToCartAction(testProd.id, testVariant.id, 1);
  assert(cartRes.success === false, "Server-side addToCartAction rejected purchase of out-of-stock size variant");
  assert(cartRes.error === "Selected size is currently out of stock", "Correct customer error message returned", cartRes.error);

  // Restore variant stock
  await updateProductVariantAction(testVariant.id, {
    stock: originalStock,
    isAvailable: originalAvailable,
    sku: testVariant.sku,
  });
  const restoredVariant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, testVariant.id),
  });
  assert(restoredVariant?.stock === originalStock, `Variant stock safely restored to ${originalStock}`);
  assert(restoredVariant?.isAvailable === originalAvailable, "Variant availability safely restored");

  // -------------------------------------------------------------------------
  // TEST 4: Campaign Promotion Controls & Persistence
  // -------------------------------------------------------------------------
  console.log("\n▶ Test 4: Dynamic Campaign Controls & Database Settings");
  const currentCampaign = await getPromotionCampaignAction();
  assert(currentCampaign.id === "navratri-sale", "getPromotionCampaignAction loads navratri-sale campaign");
  assert(currentCampaign.discountPercent === 20, "Campaign discount is 20%");

  // Update campaign to 25%
  const updatePromoRes = await updatePromotionCampaignAction({
    name: "Navratri Special",
    discountPercent: 25,
    isActive: true,
  });
  assert(updatePromoRes.success === true, "updatePromotionCampaignAction succeeded");

  const promoDbRow = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, "global"),
  });
  const storedPromotions = (promoDbRow?.promotions as Record<string, any>) || {};
  assert(storedPromotions.navratriSale?.discountPercent === 25, "Updated 25% discount persisted in site_settings.promotions jsonb");

  // Restore campaign back to 20%
  await updatePromotionCampaignAction({
    name: "Navratri Sale",
    discountPercent: 20,
    isActive: true,
  });
  const restoredCampaign = await getPromotionCampaignAction();
  assert(restoredCampaign.discountPercent === 20, "Campaign safely restored to 20% discount");

  // -------------------------------------------------------------------------
  // TEST 5: Coupon Management & WELCOME10 Protection
  // -------------------------------------------------------------------------
  console.log("\n▶ Test 5: Coupon Action Authorization & WELCOME10 Safety");
  const testCouponCode = `TESTPROMO${Date.now().toString().slice(-4)}`;
  const createCpnRes = await createCouponAction({
    code: testCouponCode,
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderValuePaise: 50000,
    isActive: true,
  });
  assert(createCpnRes.success === true, `Created temporary test coupon ${testCouponCode}`);

  // Find the created coupon
  const cpnInDb = await db.query.coupons.findFirst({
    where: eq(coupons.code, testCouponCode),
  });
  assert(cpnInDb?.value === 15, "Coupon persisted to database with 15% discount");

  // Attempt to delete WELCOME10 (must be blocked)
  const welcomeCpn = await db.query.coupons.findFirst({
    where: eq(coupons.code, "WELCOME10"),
  });
  if (welcomeCpn) {
    const delWelcomeRes = await deleteCouponAction(welcomeCpn.id);
    assert(delWelcomeRes.success === false, "deleteCouponAction correctly blocked deletion of protected WELCOME10 coupon");
  }

  // Clean up temporary test coupon
  if (cpnInDb) {
    const delRes = await deleteCouponAction(cpnInDb.id);
    assert(delRes.success === true, "Temporary test coupon successfully cleaned up");
  }

  // -------------------------------------------------------------------------
  // TEST 6: Historical Orders Deletion Protection
  // -------------------------------------------------------------------------
  console.log("\n▶ Test 6: Historical Order Integrity on Product Delete");
  const productWithOrders = await db.query.orderItems.findFirst({
    where: (items, { isNotNull }) => isNotNull(items.productId),
  });

  if (productWithOrders && productWithOrders.productId) {
    const delOrderProdRes = await deleteProductAction(productWithOrders.productId);
    assert(delOrderProdRes.success === false, "deleteProductAction correctly rejected deletion of product with existing orders");
    assert(
      delOrderProdRes.error?.includes("Cannot delete product with existing order history") === true,
      "Protected order history and provided actionable unpublish recommendation"
    );
  }

  // -------------------------------------------------------------------------
  // TEST 7: Audit Log Verification
  // -------------------------------------------------------------------------
  console.log("\n▶ Test 7: Audit Log Entries Recorded in PostgreSQL");
  const recentActivities = await db
    .select()
    .from(adminActivities)
    .orderBy(desc(adminActivities.createdAt))
    .limit(5);

  assert(recentActivities.length > 0, "admin_activities table actively records admin operations");
  const actionTypes = recentActivities.map((a) => a.action);
  assert(
    actionTypes.some((a) => a.includes("price") || a.includes("variant") || a.includes("coupon") || a.includes("promotion")),
    `Recorded diverse actions: ${actionTypes.slice(0, 3).join(", ")}`
  );

  console.log("\n================================================================================");
  console.log(`ACCEPTANCE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminE2ETests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
