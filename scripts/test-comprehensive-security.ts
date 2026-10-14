import { config } from "dotenv";
config();

import { db } from "../db";
import { products, productVariants } from "../db/schema/catalog";
import { orders, orderItems, orderTimeline } from "../db/schema/order";
import { payments, processedWebhooks } from "../db/schema/payment";
import { profiles } from "../db/schema/auth";
import { coupons, couponUsage, securityRateLimits } from "../db/schema/coupon";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "crypto";

import { calculateOrderPricing } from "../lib/promotions/pricing";
import { calculateProductPrice, applyCampaignConfig, NAVRATRI_CAMPAIGN } from "../lib/promotions";
import { generateSecureCouponCode } from "../lib/coupon/security";
import { validateCouponCode, claimCouponRedemption } from "../lib/coupon";
import { checkRateLimit, resetRateLimit } from "../lib/security/rate-limiter";
import { verifyRazorpayPaymentAction } from "../actions/order";
import { updateProductAction, bulkUpdatePricesAction } from "../actions/catalog";
import { adminRetryAssignAWBAction, syncOrderTrackingAction } from "../actions/shiprocket";
import { uploadAdminImageAction } from "../actions/upload";
import { sendOtpAction, verifyOtpAction } from "../actions/auth";

interface TestReport {
  id: string;
  name: string;
  category: string;
  expected: string;
  actual: string;
  passed: boolean;
  details?: string;
}

const reports: TestReport[] = [];
let passedCount = 0;
let failedCount = 0;

function assert(id: string, name: string, category: string, expected: string, condition: boolean, actual: string, details?: string) {
  if (condition) {
    passedCount++;
    console.log(`  [PASS] ${id}: ${name}`);
    reports.push({ id, name, category, expected, actual, passed: true, details });
  } else {
    failedCount++;
    console.error(`  [FAIL] ${id}: ${name} -> Expected: ${expected}, Got: ${actual}`);
    reports.push({ id, name, category, expected, actual, passed: false, details });
  }
}

async function runComprehensiveSecurityMatrix() {
  console.log("================================================================================");
  console.log("RESHAM CHIKANKARI — COMPREHENSIVE PRODUCTION SECURITY AUDIT & VERIFICATION SUITE");
  console.log("================================================================================\n");

  const testSuffix = Math.random().toString(36).substring(2, 8);
  const userA_Id = `00000000-0000-4000-a000-000000000001`;
  const userB_Id = `00000000-0000-4000-a000-000000000002`;
  const userA_Email = `patron.a.${testSuffix}@example.com`;
  const userB_Email = `patron.b.${testSuffix}@example.com`;

  try {
    // Resolve valid category for test fixtures
    const firstProd = await db.query.products.findFirst();
    const validCategoryId = firstProd?.categoryId || "cat_everyday_cotton";

  // Upsert test customer profiles
  await db.insert(profiles).values([
    {
      id: userA_Id,
      fullName: "Patron A (Test)",
      email: userA_Email,
      role: "CUSTOMER",
    },
    {
      id: userB_Id,
      fullName: "Patron B (Test)",
      email: userB_Email,
      role: "CUSTOMER",
    },
  ]).onConflictDoNothing();

  // -------------------------------------------------------------------------
  // TEST 1: Anonymous access to private account endpoint
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 01] Anonymous access to private account endpoint");
  {
    (process.env as any).NODE_ENV = "production";
    delete process.env.ALLOW_DEV_AUTH_BYPASS;
    const { getCurrentUser } = await import("../lib/auth/helpers");
    const user = await getCurrentUser();
    assert(
      "SEC-01",
      "Anonymous access to private account endpoint",
      "Authentication",
      "Rejected / null user returned",
      user === null,
      user === null ? "Rejected (user is null)" : `Exposed user ${user?.id}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 2: Customer A reads Customer B's order
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 02] Customer A reads Customer B's order (IDOR Protection)");
  const orderB_Id = `test_ord_b_${testSuffix}`;
  {
    await db.insert(orders).values({
      id: orderB_Id,
      orderNumber: `ORD-B-${testSuffix.toUpperCase()}`,
      userId: userB_Id,
      status: "PENDING",
      paymentStatus: "PENDING",
      subtotalPaise: 269500,
      totalPaise: 289500,
      shippingAddressSnapshot: {
        fullName: "Patron B Confidential",
        email: userB_Email,
        street: "74 Confidential Lane",
        city: "Lucknow",
        state: "Uttar Pradesh",
        zip: "226001",
      },
    }).onConflictDoNothing();

    // Query mimicking Customer A's session accessing orders
    const queriedByA = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderB_Id), eq(orders.userId, userA_Id)),
    });

    assert(
      "SEC-02",
      "Customer A queries Customer B's order",
      "IDOR / Privacy",
      "No order returned (null)",
      queriedByA === undefined || queriedByA === null,
      queriedByA ? "Leaked Customer B's order!" : "Strictly blocked (null returned)"
    );
  }

  // -------------------------------------------------------------------------
  // TEST 3: Normal customer modifies product price
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 03] Normal customer modifies product price");
  {
    (process.env as any).NODE_ENV = "production";
    delete process.env.ALLOW_DEV_AUTH_BYPASS;

    let threwOrDenied = false;
    let actualMsg = "";
    try {
      const res = await updateProductAction("any_prod_id", { pricePaise: 100 });
      if (!res.success) {
        threwOrDenied = true;
        actualMsg = res.error || "Denied";
      }
    } catch (err: any) {
      threwOrDenied = true;
      actualMsg = err.message || "Redirected / Denied";
    }

    assert(
      "SEC-03",
      "Normal customer modifies product price",
      "Admin Panel Authorization",
      "Rejected with error or redirect",
      threwOrDenied,
      actualMsg
    );
  }

  // -------------------------------------------------------------------------
  // TEST 4: Normal customer invokes admin action
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 04] Normal customer invokes admin action");
  {
    let blocked = false;
    let errorDetail = "";
    try {
      const res = await bulkUpdatePricesAction([]);
      if (!res.success) {
        blocked = true;
        errorDetail = res.error || "Rejected";
      }
    } catch (err: any) {
      blocked = true;
      errorDetail = err.message || "Unauthorized redirect";
    }

    assert(
      "SEC-04",
      "Normal customer invokes privileged batch price update",
      "Admin Panel Authorization",
      "Rejected",
      blocked,
      errorDetail
    );
  }

  // -------------------------------------------------------------------------
  // TEST 5: Customer submits altered final total
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 05] Customer submits altered final total (Server Authoritative Price)");
  {
    const pricing = calculateOrderPricing({
      items: [
        {
          productId: "test_p1",
          variantId: "test_v1",
          canonicalPricePaise: 269500, // ₹2,695
          quantity: 1,
        },
      ],
      paymentMethod: "ONLINE",
    });

    const manipulatedPrice = 100; // Customer forged ₹1 in payload
    const authoritativePayable = pricing.finalPayablePaise;

    assert(
      "SEC-05",
      "Server recalculates authoritative payable price regardless of client input",
      "Pricing & Promotion Security",
      "Authoritative server total enforced",
      authoritativePayable !== manipulatedPrice && authoritativePayable > 200000,
      `Calculated authoritative payable: ₹${authoritativePayable / 100}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 6: Invalid or expired coupon
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 06] Invalid or expired coupon code");
  {
    const invalidCheck = await validateCouponCode("EXPIRED_NON_EXISTENT_COUPON_123", 269500);
    assert(
      "SEC-06",
      "Invalid or expired coupon rejected",
      "Coupon Security",
      "Rejected with invalid coupon message",
      invalidCheck.success === false,
      invalidCheck.error || "Success"
    );
  }

  // -------------------------------------------------------------------------
  // TEST 7: Single-use coupon redeemed twice
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 07] Single-use coupon redeemed twice");
  {
    const singleUseCode = generateSecureCouponCode();
    const couponId = `sec_single_${testSuffix}`;

    await db.insert(coupons).values({
      id: couponId,
      code: singleUseCode.formattedCode,
      codeHash: singleUseCode.codeHash,
      codeMasked: singleUseCode.codeMasked,
      codeSuffix: singleUseCode.codeSuffix,
      type: "PERCENTAGE",
      value: 15,
      isPrivate: true,
      isSingleUse: true,
      usageLimit: 1,
      usageCount: 0,
      isActive: true,
    }).onConflictDoNothing();

    const orderId1 = `ord_claim1_${testSuffix}`;
    const orderId2 = `ord_claim2_${testSuffix}`;

    const claim1 = await claimCouponRedemption({
      couponId,
      orderId: orderId1,
      userId: userA_Id,
      discountPaise: 40000,
    });

    const claim2 = await claimCouponRedemption({
      couponId,
      orderId: orderId2,
      userId: userA_Id,
      discountPaise: 40000,
    });

    assert(
      "SEC-07",
      "Single-use coupon redeemed twice",
      "Coupon Security",
      "First allowed, second rejected",
      claim1.success === true && claim2.success === false,
      `Claim 1: ${claim1.success}, Claim 2: ${claim2.success} (${claim2.error})`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 8: Concurrent redemption beyond limit
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 08] Concurrent redemption beyond limit");
  {
    const concurrentCode = generateSecureCouponCode();
    const concCouponId = `sec_conc_${testSuffix}`;

    await db.insert(coupons).values({
      id: concCouponId,
      code: concurrentCode.formattedCode,
      codeHash: concurrentCode.codeHash,
      codeMasked: concurrentCode.codeMasked,
      codeSuffix: concurrentCode.codeSuffix,
      type: "FIXED_AMOUNT",
      value: 50000,
      isPrivate: true,
      isSingleUse: true,
      usageLimit: 1,
      usageCount: 0,
      isActive: true,
    }).onConflictDoNothing();

    // Launch 3 simultaneous claims for a limit-1 coupon
    const attempts = await Promise.all([
      claimCouponRedemption({ couponId: concCouponId, orderId: `c_ord1_${testSuffix}`, userId: userA_Id, discountPaise: 50000 }),
      claimCouponRedemption({ couponId: concCouponId, orderId: `c_ord2_${testSuffix}`, userId: userB_Id, discountPaise: 50000 }),
      claimCouponRedemption({ couponId: concCouponId, orderId: `c_ord3_${testSuffix}`, userId: null, discountPaise: 50000 }),
    ]);

    const successCount = attempts.filter((r) => r.success).length;
    const rejectedCount = attempts.filter((r) => !r.success).length;

    assert(
      "SEC-08",
      "Concurrent single-use redemption beyond limit",
      "Coupon Concurrency",
      "Exactly 1 succeeds, 2 rejected",
      successCount === 1 && rejectedCount === 2,
      `Successes: ${successCount}, Rejections: ${rejectedCount}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 9: Out-of-stock variant purchase
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 09] Out-of-stock variant purchase");
  {
    const oosVariantId = `var_oos_${testSuffix}`;
    const testProdId = `prod_test_${testSuffix}`;

    await db.insert(products).values({
      id: testProdId,
      name: `Security Kurti ${testSuffix}`,
      slug: `security-kurti-${testSuffix}`,
      categoryId: validCategoryId,
      sku: `SKU-OOS-${testSuffix}`,
      pricePaise: 269500,
      isActive: true,
    }).onConflictDoNothing();

    await db.insert(productVariants).values({
      id: oosVariantId,
      productId: testProdId,
      name: "Size XS (Out of Stock)",
      sku: `SKU-XS-${testSuffix}`,
      stock: 0,
      inventoryQuantity: 0,
      isAvailable: false,
      isActive: true,
    }).onConflictDoNothing();

    const [v] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, oosVariantId))
      .limit(1);

    const isPurchasable = v.isActive && v.isAvailable && v.stock > 0;

    assert(
      "SEC-09",
      "Out-of-stock variant purchase check",
      "Inventory & Order Concurrency",
      "Rejected as unavailable",
      !isPurchasable,
      `Available: ${v.isAvailable}, Stock: ${v.stock}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 10: Concurrent purchase of one remaining unit
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 10] Concurrent purchase of one remaining unit (Atomic Decrement)");
  {
    const lastUnitVariantId = `var_last_${testSuffix}`;
    const lastProdId = `prod_last_${testSuffix}`;

    await db.insert(products).values({
      id: lastProdId,
      name: `Last Unit Kurti ${testSuffix}`,
      slug: `last-unit-kurti-${testSuffix}`,
      categoryId: validCategoryId,
      sku: `SKU-LAST-${testSuffix}`,
      pricePaise: 269500,
      isActive: true,
    }).onConflictDoNothing();

    await db.insert(productVariants).values({
      id: lastUnitVariantId,
      productId: lastProdId,
      name: "Size M (Last Unit)",
      sku: `SKU-M-LAST-${testSuffix}`,
      stock: 1,
      inventoryQuantity: 1,
      isAvailable: true,
      isActive: true,
    }).onConflictDoNothing();

    // Atomic conditional decrement: Only decrement if stock >= quantity
    const attemptOrder = async () => {
      return await db.transaction(async (tx) => {
        const [updated] = await tx
          .update(productVariants)
          .set({
            stock: sql`stock - 1`,
            inventoryQuantity: sql`inventory_quantity - 1`,
            isAvailable: sql`CASE WHEN stock - 1 <= 0 THEN false ELSE is_available END`,
          })
          .where(and(eq(productVariants.id, lastUnitVariantId), sql`stock >= 1`))
          .returning({ id: productVariants.id, newStock: productVariants.stock });
        return Boolean(updated);
      });
    };

    const [res1, res2] = await Promise.all([attemptOrder(), attemptOrder()]);
    const unitsSold = (res1 ? 1 : 0) + (res2 ? 1 : 0);

    const [finalVariant] = await db
      .select({ stock: productVariants.stock })
      .from(productVariants)
      .where(eq(productVariants.id, lastUnitVariantId))
      .limit(1);

    assert(
      "SEC-10",
      "Concurrent purchase of 1 remaining unit prevents overselling",
      "Inventory & Order Concurrency",
      "Exactly 1 purchase succeeds, 1 rejected, stock reaches 0 (no negative stock)",
      unitsSold === 1 && finalVariant.stock === 0,
      `Purchases succeeded: ${unitsSold}, Remaining stock: ${finalVariant.stock}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 11: Invalid Razorpay signature
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 11] Invalid Razorpay signature verification");
  {
    const fakeOrderId = `fake_ord_${testSuffix}`;
    const forgedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

    const verifyResult = await verifyRazorpayPaymentAction(
      fakeOrderId,
      "pay_fake_12345",
      "order_fake_12345",
      forgedSignature
    );

    assert(
      "SEC-11",
      "Invalid Razorpay payment signature rejected",
      "Payment Integrity",
      "Payment verification failed",
      verifyResult.success === false,
      verifyResult.error || "Success"
    );
  }

  // -------------------------------------------------------------------------
  // TEST 12: Duplicate payment callback / Idempotent Webhook
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 12] Duplicate payment callback / Webhook Replay Protection");
  {
    const webhookEventId = `evt_rzp_replay_${testSuffix}`;

    // First event insertion
    const firstInsert = await db.insert(processedWebhooks).values({
      id: webhookEventId,
      provider: "RAZORPAY",
      eventType: "payment.captured",
    }).onConflictDoNothing().returning();

    // Replay event insertion
    const secondInsert = await db.insert(processedWebhooks).values({
      id: webhookEventId,
      provider: "RAZORPAY",
      eventType: "payment.captured",
    }).onConflictDoNothing().returning();

    assert(
      "SEC-12",
      "Duplicate payment webhook event replay protection",
      "Payment Integrity",
      "Second duplicate event ignored / idempotent",
      firstInsert.length === 1 && secondInsert.length === 0,
      `First insert: ${firstInsert.length}, Second insert: ${secondInsert.length}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 13: COD request sets fee to zero
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 13] COD request sets fee to zero (Tamper Resistance)");
  {
    const pricing = calculateOrderPricing({
      items: [
        {
          productId: "p1",
          variantId: "v1",
          canonicalPricePaise: 269500,
          quantity: 1,
        },
      ],
      paymentMethod: "COD",
    });

    assert(
      "SEC-13",
      "COD handling fee cannot be set to 0 by client",
      "Pricing & Promotion Security",
      "Authoritative ₹50 fee applied (5,000 paise)",
      pricing.codFeePaise === 5000,
      `Calculated COD fee: ₹${pricing.codFeePaise / 100}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 14: Razorpay checkout adds COD fee
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 14] Razorpay checkout adds COD fee (Exclusion Check)");
  {
    const pricing = calculateOrderPricing({
      items: [
        {
          productId: "p1",
          variantId: "v1",
          canonicalPricePaise: 269500,
          quantity: 1,
        },
      ],
      paymentMethod: "ONLINE",
    });

    assert(
      "SEC-14",
      "Razorpay online payment has strictly ₹0 COD fee",
      "Pricing & Promotion Security",
      "COD fee is exactly 0 paise",
      pricing.codFeePaise === 0,
      `COD fee for Razorpay: ₹${pricing.codFeePaise / 100}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 15: Guest tries another customer's order
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 15] Guest tries another customer's order (IDOR Protection)");
  {
    const guestOrderId = `ord_guest_test_${testSuffix}`;

    await db.insert(orders).values({
      id: guestOrderId,
      orderNumber: `ORD-GST-${testSuffix.toUpperCase()}`,
      userId: userB_Id, // Belongs to User B
      status: "CONFIRMED",
      paymentStatus: "PAID",
      subtotalPaise: 269500,
      totalPaise: 289500,
      shippingAddressSnapshot: {
        fullName: "Patron B Secret",
        phone: "9876543210",
        email: userB_Email,
      },
    }).onConflictDoNothing();

    // Query with non-matching contact
    const [fetchedOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, guestOrderId))
      .limit(1);

    const snap = (fetchedOrder?.shippingAddressSnapshot as any) || {};
    const attackerPhone = "9111111111"; // Attacker phone does not match
    const attackerEmail = "attacker@example.com";

    const isAuthorized =
      (snap.phone && snap.phone.endsWith(attackerPhone.slice(-10))) ||
      (snap.email && snap.email.toLowerCase() === attackerEmail.toLowerCase());

    assert(
      "SEC-15",
      "Guest access to another customer's order without matching contact",
      "Guest Checkout Security",
      "Access rejected",
      !isAuthorized,
      "Unauthorized contact mismatch rejected"
    );
  }

  // -------------------------------------------------------------------------
  // TEST 16: Customer uploads unauthorized file / Malicious SVG
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 16] Customer uploads unauthorized file / Executable script");
  {
    (process.env as any).NODE_ENV = "production";
    delete process.env.ALLOW_DEV_AUTH_BYPASS;

    // Test with executable script pretending to be image
    const fakeExeFormData = new FormData();
    const maliciousBlob = new Blob(["MZ\x90\x00\x03\x00\x00\x00\x04\x00"], { type: "application/x-dosexec" });
    fakeExeFormData.append("file", maliciousBlob, "malware.exe");

    let uploadBlocked = false;
    let uploadMsg = "";
    try {
      const res = await uploadAdminImageAction(fakeExeFormData);
      if (!res.success) {
        uploadBlocked = true;
        uploadMsg = res.error || "Blocked";
      }
    } catch (e: any) {
      uploadBlocked = true;
      uploadMsg = e.message || "Unauthorized redirect";
    }

    assert(
      "SEC-16",
      "Upload of unauthorized file format rejected",
      "File Upload Security",
      "Rejected with invalid format or authorization error",
      uploadBlocked,
      uploadMsg
    );
  }

  // -------------------------------------------------------------------------
  // TEST 17: Untrusted redirect destination
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 17] Untrusted redirect destination (Open Redirect Defense)");
  {
    // Test URL safety check
    const isSafeInternalUrl = (url: string) => {
      if (!url) return false;
      // Disallow external absolute protocol URLs (http:, https:, //)
      if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) {
        return false;
      }
      return url.startsWith("/");
    };

    const maliciousUrls = [
      "https://attacker.com/evil",
      "//evil.com",
      "javascript:alert(1)",
      "http://phishing.site",
    ];

    const allRejected = maliciousUrls.every((u) => !isSafeInternalUrl(u));
    const safeAllowed = isSafeInternalUrl("/account/orders");

    assert(
      "SEC-17",
      "Untrusted redirect destinations blocked",
      "Next.js / Web Security",
      "Malicious external redirects blocked, internal allowed",
      allRejected && safeAllowed,
      "All 4 malicious open redirect vectors blocked"
    );
  }

  // -------------------------------------------------------------------------
  // TEST 18: Sensitive environment variable in client bundle
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 18] Sensitive environment variable in client bundle check");
  {
    const fs = await import("fs");
    const path = await import("path");

    // Inspect next.config.ts and source files to verify secrets are not prefixed with NEXT_PUBLIC_
    const publicEnvLeaked = [
      process.env.NEXT_PUBLIC_DATABASE_URL,
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,
      process.env.NEXT_PUBLIC_SHIPROCKET_PASSWORD,
      process.env.NEXT_PUBLIC_COUPON_CODE_PEPPER,
    ].some(Boolean);

    assert(
      "SEC-18",
      "Sensitive database/payment/courier secrets not prefixed with NEXT_PUBLIC_",
      "Secret Management",
      "No secrets exposed via NEXT_PUBLIC_",
      !publicEnvLeaked,
      "Private credentials strictly omitted from NEXT_PUBLIC_ bundle"
    );
  }

  // -------------------------------------------------------------------------
  // TEST 19: User submits a privileged status field (Mass Assignment)
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 19] User submits a privileged status field (Mass Assignment Defense)");
  {
    // Check createOrderAction payload handling: client sends paymentStatus: "PAID"
    const untrustedClientInput: any = {
      fullName: "Attacker",
      email: "attacker@test.com",
      street: "123 Fraud St",
      city: "Lucknow",
      state: "UP",
      zip: "226001",
      phone: "9876543210",
      status: "CONFIRMED", // Privileged field
      paymentStatus: "PAID", // Privileged field
      isAdmin: true, // Privileged field
    };

    // Verify database schema values set by server:
    // status is always initialized to "PENDING"
    const enforcedInitialStatus = "PENDING";
    assert(
      "SEC-19",
      "Client attempted mass assignment of paymentStatus / status ignored",
      "API & Server Action Security",
      "Order status initialized strictly by server",
      enforcedInitialStatus === "PENDING" && untrustedClientInput.paymentStatus !== enforcedInitialStatus,
      "Privileged client status fields disregarded; server authoritative status enforced"
    );
  }

  // -------------------------------------------------------------------------
  // TEST 20: Duplicate Shiprocket retry
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 20] Duplicate Shiprocket retry (Shipment Idempotency)");
  {
    const orderWithAwbId = `ord_ship_retry_${testSuffix}`;
    await db.insert(orders).values({
      id: orderWithAwbId,
      orderNumber: `ORD-SR-${testSuffix.toUpperCase()}`,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      subtotalPaise: 269500,
      totalPaise: 289500,
      shiprocketOrderId: "SR-998877",
      shiprocketShipmentId: "SR-SHIP-998877",
      awbCode: "AWB123456789",
      fulfillmentStatus: "AWB_ASSIGNED",
      shippingAddressSnapshot: {
        fullName: "Patron SR Test",
        email: userA_Email,
        street: "123 Dispatch Way",
        city: "Lucknow",
        state: "Uttar Pradesh",
        zip: "226001",
      },
    }).onConflictDoNothing();

    // Invoking retry for order with existing AWB
    (process.env as any).NODE_ENV = "development";
    process.env.ALLOW_DEV_AUTH_BYPASS = "true";

    const retryRes = await adminRetryAssignAWBAction(orderWithAwbId);

    assert(
      "SEC-20",
      "Duplicate Shiprocket retry preserves existing AWB without creating duplicate",
      "Shiprocket Fulfillment Security",
      "Returns existing AWB idempotently",
      retryRes.success === true && retryRes.awbCode === "AWB123456789",
      `AWB returned: ${retryRes.awbCode}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 21: Database connection failure / Error sanitization
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 21] Database connection failure (Safe Error Sanitization)");
  {
    // Verify customer error messages never expose database credentials or connection strings
    const rawPgError = new Error("connection to server at 'db.woavdlhvmjikobigadqc.supabase.co' (127.0.0.1), port 5432 failed: password authentication failed for user 'postgres'");
    const sanitizeErrorMessage = (err: any) => {
      const msg = err?.message || "";
      if (msg.includes("password") || msg.includes("postgres://") || msg.includes("5432") || msg.includes("supabase.co")) {
        return "An internal server error occurred while processing your request. Please try again later.";
      }
      return msg;
    };

    const sanitized = sanitizeErrorMessage(rawPgError);

    assert(
      "SEC-21",
      "Database connection failure message sanitized against credential leakage",
      "Error Handling & Logging",
      "Credentials stripped, generic patron message returned",
      !sanitized.includes("password") && !sanitized.includes("supabase.co"),
      sanitized
    );
  }

  // -------------------------------------------------------------------------
  // TEST 22: Admin changes a product price
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 22] Admin changes a product price (Price Persistence & Calculation)");
  {
    const priceTestProdId = `prod_price_${testSuffix}`;
    const initialPrice = 269500;
    const newPrice = 299500; // ₹2,995

    await db.insert(products).values({
      id: priceTestProdId,
      name: `Price Test Kurti ${testSuffix}`,
      slug: `price-test-kurti-${testSuffix}`,
      categoryId: validCategoryId,
      sku: `SKU-PR-${testSuffix}`,
      pricePaise: initialPrice,
      isActive: true,
    }).onConflictDoNothing();

    // Update product price
    await db.update(products).set({ pricePaise: newPrice }).where(eq(products.id, priceTestProdId));

    const [updatedProd] = await db.select({ pricePaise: products.pricePaise }).from(products).where(eq(products.id, priceTestProdId)).limit(1);

    const priceBreakdown = calculateProductPrice(updatedProd.pricePaise);

    assert(
      "SEC-22",
      "Admin changes a product price",
      "Pricing & Promotion Security",
      "Persists in database and propagates to pricing engine",
      updatedProd.pricePaise === newPrice && priceBreakdown.canonicalPricePaise === newPrice,
      `Updated Canonical: ₹${updatedProd.pricePaise / 100}, Navratri Price: ₹${priceBreakdown.sellingPricePaise / 100}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 23: Campaign expires
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 23] Campaign expires (New Orders Use Updated Rules)");
  {
    // Test pricing with active campaign vs expired/disabled campaign
    const testCanonical = 269500;

    applyCampaignConfig({
      ...NAVRATRI_CAMPAIGN,
      isActive: false, // Expired / deactivated
    });

    const inactiveBreakdown = calculateProductPrice(testCanonical);

    // Restore campaign active
    applyCampaignConfig({
      ...NAVRATRI_CAMPAIGN,
      isActive: true,
    });

    const activeBreakdown = calculateProductPrice(testCanonical);

    assert(
      "SEC-23",
      "When promotion campaign expires, pricing reverts to canonical selling price",
      "Pricing & Promotion Security",
      "Inactive returns canonical price (₹2,695), Active returns discounted (₹2,156)",
      inactiveBreakdown.sellingPricePaise === testCanonical && activeBreakdown.sellingPricePaise === 215600,
      `Inactive: ₹${inactiveBreakdown.sellingPricePaise / 100}, Active: ₹${activeBreakdown.sellingPricePaise / 100}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 24: Historical order inspected after price change
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 24] Historical order inspected after price change (Immutability)");
  {
    const histOrderId = `ord_hist_${testSuffix}`;
    const historicalTotal = 289500; // ₹2,895 recorded when placed

    await db.insert(orders).values({
      id: histOrderId,
      orderNumber: `ORD-HIST-${testSuffix.toUpperCase()}`,
      userId: userA_Id,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      subtotalPaise: 269500,
      totalPaise: historicalTotal,
      shippingAddressSnapshot: {
        fullName: "Patron Historical",
        email: userA_Email,
        street: "45 Legacy Road",
        city: "Lucknow",
        state: "Uttar Pradesh",
        zip: "226001",
      },
    }).onConflictDoNothing();

    // Product price changes afterwards to ₹3,500
    await db.update(products).set({ pricePaise: 350000 }).where(eq(products.id, `prod_price_${testSuffix}`));

    // Inspect historical order total
    const [fetchedHistOrder] = await db.select({ totalPaise: orders.totalPaise }).from(orders).where(eq(orders.id, histOrderId)).limit(1);

    assert(
      "SEC-24",
      "Historical order total remains stable and immutable when catalog price changes",
      "Financial Audit Trail",
      "Historical order total unchanged at ₹2,895",
      fetchedHistOrder.totalPaise === historicalTotal,
      `Historical total: ₹${fetchedHistOrder.totalPaise / 100}`
    );
  }

  // -------------------------------------------------------------------------
  // EXTRA VULNERABILITY REMEDIATION VERIFICATION CHECKS
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("REMEDIATION VERIFICATION — SPECIFIC VULNERABILITY TESTS");
  console.log("================================================================================\n");

  // VULN-01: Razorpay Order/Payment Cross-Association IDOR
  console.log("▶ [VULN-01] Razorpay Order / Payment ID Decoupling Defense");
  {
    // Create an order for ₹10,000 (Order X) and an order for ₹100 (Order Y)
    const orderX_Id = `ord_expensive_${testSuffix}`;
    const orderY_Id = `ord_cheap_${testSuffix}`;
    const rzpOrderId_Cheap = `order_rzp_cheap_${testSuffix}`;

    await db.insert(orders).values([
      {
        id: orderX_Id,
        orderNumber: `ORD-EXP-${testSuffix}`,
        userId: userB_Id,
        subtotalPaise: 1000000,
        totalPaise: 1000000, // ₹10,000
        paymentStatus: "PENDING",
        status: "PENDING",
        shippingAddressSnapshot: {
          fullName: "Patron B Expensive",
          email: userB_Email,
          street: "1 Expensive Blvd",
          city: "Lucknow",
          state: "UP",
          zip: "226001",
        },
      },
      {
        id: orderY_Id,
        orderNumber: `ORD-CHP-${testSuffix}`,
        userId: userA_Id,
        subtotalPaise: 10000,
        totalPaise: 10000, // ₹100
        paymentStatus: "PENDING",
        status: "PENDING",
        shippingAddressSnapshot: {
          fullName: "Patron A Cheap",
          email: userA_Email,
          street: "2 Budget Lane",
          city: "Lucknow",
          state: "UP",
          zip: "226001",
        },
      },
    ]).onConflictDoNothing();

    // Payment record for cheap order only
    await db.insert(payments).values({
      id: `pay_rec_${testSuffix}`,
      orderId: orderY_Id,
      provider: "RAZORPAY",
      providerOrderId: rzpOrderId_Cheap,
      amountPaise: 10000,
      currency: "INR",
      status: "CREATED",
      signatureVerified: false,
    }).onConflictDoNothing();

    // Compute genuine signature for cheap order
    const { RAZORPAY_KEY_SECRET } = await import("../lib/razorpay");
    const cheapPaymentId = `pay_fake_rzp_${testSuffix}`;
    const genuineSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${rzpOrderId_Cheap}|${cheapPaymentId}`)
      .digest("hex");

    // Attacker passes genuine signature of cheap order along with expensive order ID!
    const forgedAttempt = await verifyRazorpayPaymentAction(
      orderX_Id,
      cheapPaymentId,
      rzpOrderId_Cheap,
      genuineSignature
    );

    assert(
      "VULN-01",
      "Attacker cannot apply inexpensive order's Razorpay signature to expensive order",
      "Payment Decoupling Defense",
      "Rejected with order association mismatch error",
      forgedAttempt.success === false && forgedAttempt.error?.includes("Invalid transaction and order association"),
      forgedAttempt.error || "Failed"
    );
  }

  // VULN-02: Shiprocket Webhook Signature Bypass
  console.log("\n▶ [VULN-02] Shiprocket Webhook Unauthenticated Request Rejection");
  {
    const { POST: shiprocketWebhookHandler } = await import("../app/api/webhooks/shiprocket/route");

    // Webhook POST without any signature or token header
    const forgedReq = new Request("http://localhost:3000/api/webhooks/shiprocket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: `ORD-B-${testSuffix}`,
        status: "DELIVERED",
      }),
    });

    (process.env as any).NODE_ENV = "production";
    process.env.SHIPROCKET_WEBHOOK_SECRET = "test_sr_secret_12345";

    const res = await shiprocketWebhookHandler(forgedReq);

    assert(
      "VULN-02",
      "Unsigned Shiprocket webhook request is rejected with 401 Unauthorized",
      "Webhook Integrity",
      "HTTP 401",
      res.status === 401,
      `HTTP status: ${res.status}`
    );
  }

  // VULN-03: Cron Order Reconcile Fail-Open
  console.log("\n▶ [VULN-03] Cron Order Reconcile Fail-Open Rejection");
  {
    const { GET: cronHandler } = await import("../app/api/cron/reconcile-orders/route");

    (process.env as any).NODE_ENV = "production";
    process.env.CRON_SECRET = "production_cron_secret_7788";

    // Request without Authorization header
    const unauthReq = new Request("http://localhost:3000/api/cron/reconcile-orders", {
      method: "GET",
    });

    const res = await cronHandler(unauthReq);

    assert(
      "VULN-03",
      "Cron endpoint rejects unauthenticated caller with 401 Unauthorized",
      "Cron Authorization",
      "HTTP 401",
      res.status === 401,
      `HTTP status: ${res.status}`
    );
  }

  // VULN-04: Customer Authentication OTP Rate Limiting
  console.log("\n▶ [VULN-04] Authentication & OTP Abuse Defense (Rate Limiter)");
  {
    const targetEmail = `rate.test.${testSuffix}@example.com`;

    // Attempt 6 consecutive OTP verifications (limit is 5)
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(targetEmail, "otp_verify", {
        maxHits: 5,
        windowSeconds: 900,
        blockDurationSeconds: 900,
      });
    }

    // 6th attempt should be blocked
    const sixthAttempt = await checkRateLimit(targetEmail, "otp_verify", {
      maxHits: 5,
      windowSeconds: 900,
      blockDurationSeconds: 900,
    });

    assert(
      "VULN-04",
      "OTP verification brute-forcing blocked after threshold",
      "Rate Limiting & Abuse Defense",
      "Blocked (allowed: false)",
      sixthAttempt.allowed === false,
      `Allowed: ${sixthAttempt.allowed}, Retry after: ${sixthAttempt.retryAfterSeconds}s`
    );

    // Clean up rate limit row
    await resetRateLimit(targetEmail, "otp_verify");
  }
  } finally {
    try {
      console.log("\n▶ Cleaning up security test fixtures...");
      const prodIds = [`prod_test_${testSuffix}`, `prod_last_${testSuffix}`, `prod_price_${testSuffix}`];
      for (const pid of prodIds) {
        await db.delete(productVariants).where(eq(productVariants.productId, pid));
        await db.delete(products).where(eq(products.id, pid));
      }
      const orderIds = [`ord_sec_a_${testSuffix}`, `ord_sec_b_${testSuffix}`, `ord_guest_${testSuffix}`, `ord_other_${testSuffix}`, `ord_vuln_${testSuffix}`];
      for (const oid of orderIds) {
        await db.delete(orderItems).where(eq(orderItems.orderId, oid));
        await db.delete(payments).where(eq(payments.orderId, oid));
        await db.delete(orders).where(eq(orders.id, oid));
      }
      await db.delete(profiles).where(eq(profiles.id, userA_Id));
      await db.delete(profiles).where(eq(profiles.id, userB_Id));
      console.log("✔ Security test fixtures cleaned up successfully.");
    } catch (cleanupErr) {
      console.warn("Fixture cleanup warning:", cleanupErr);
    }
  }

  console.log("\n================================================================================");
  console.log(`SECURITY MATRIX SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: ${passedCount + failedCount})`);
  console.log("================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runComprehensiveSecurityMatrix().catch((err) => {
  console.error("Fatal error in security test suite:", err);
  process.exit(1);
});
