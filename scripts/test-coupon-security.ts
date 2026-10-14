import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { db } from "../db";
import { coupons, couponUsage, type Coupon } from "../db/schema/coupon";
import { orders } from "../db/schema/order";
import { eq, desc, and } from "drizzle-orm";
import {
  generateSecureCouponCode,
  normalizeCouponLookup,
  computeCouponHash,
  isPredictablePattern,
  SECURE_COUPON_ALPHABET,
  SECURE_COUPON_RANDOM_LENGTH,
} from "../lib/coupon/security";
import {
  validateCouponCode,
  claimCouponRedemption,
  releaseCouponRedemption,
} from "../lib/coupon";
import {
  generatePrivateCouponAction,
  revokeCouponAction,
  createCouponAction,
} from "../actions/coupon";
import { calculateOrderPricing } from "../lib/promotions/pricing";
import { checkRateLimit } from "../lib/security/rate-limiter";

// Enable development admin bypass for test environment
(process.env as any).NODE_ENV = "development";
process.env.ALLOW_DEV_AUTH_BYPASS = "true";
process.env.ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runCouponSecurityTests() {
  console.log("================================================================================");
  console.log("RESHAM CHIKANKARI — SECURE COUPON & VULNERABILITY AUDIT REGRESSION SUITE");
  console.log("================================================================================\n");

  const { securityRateLimits } = await import("../db/schema/coupon");
  await db.delete(securityRateLimits).catch(() => {});

  // -------------------------------------------------------------------------
  // TEST A — Cryptographically Random Code Generation & Entropy
  // -------------------------------------------------------------------------
  console.log("▶ Test A: Cryptographically Secure Random Code Generation & Entropy");
  const sampleCodes = new Set<string>();
  const iterations = 50;

  for (let i = 0; i < iterations; i++) {
    const details = generateSecureCouponCode();
    sampleCodes.add(details.formattedCode);

    assert(
      details.formattedCode.startsWith("RC-"),
      `Format starts with RC- namespace (${details.formattedCode.slice(0, 7)}...)`
    );
    assert(
      details.normalizedCode.length === SECURE_COUPON_RANDOM_LENGTH,
      `Normalized length is exactly 16 random characters (${details.normalizedCode.length})`
    );
    assert(
      details.codeHash.length === 64,
      "HMAC-SHA-256 digest is 64 hex characters (256 bits)"
    );

    // Verify all characters are in 32-character unambiguous alphabet
    const allValidChars = details.normalizedCode
      .split("")
      .every((c) => SECURE_COUPON_ALPHABET.includes(c));
    assert(allValidChars, "All characters belong to 32-char unambiguous alphabet");

    // Verify no ambiguous characters (0, O, 1, I)
    const hasAmbiguous = /[0O1I]/.test(details.normalizedCode);
    assert(!hasAmbiguous, "Zero ambiguous characters (no 0, O, 1, I)");
  }

  assert(
    sampleCodes.size === iterations,
    `Generated ${iterations} unique random codes with zero collisions (80-bit entropy)`
  );

  // -------------------------------------------------------------------------
  // TEST B — Guessable & Predictable Code Rejection
  // -------------------------------------------------------------------------
  console.log("\n▶ Test B: Guessable & Predictable Pattern Rejection");
  const predictableGuesses = [
    "DIWALI15",
    "NAVRATRI20",
    "RESHAM20",
    "SAVE500",
    "FIRSTORDER",
    "PROMO10",
    "SPECIAL20",
    "FLAT500",
  ];

  for (let idx = 0; idx < predictableGuesses.length; idx++) {
    const guess = predictableGuesses[idx];
    const patternMatch = isPredictablePattern(guess);
    assert(patternMatch, `isPredictablePattern correctly identified guessable code '${guess}'`);

    const validation = await validateCouponCode(guess, 200000, { ipAddress: `test_b_ip_${idx}` });
    assert(!validation.success, `Unconfigured guess '${guess}' rejected with error: ${validation.error}`);
  }

  // Attempt to create a predictable public coupon (must be rejected)
  const badCreate = await createCouponAction({
    code: "DIWALI15",
    discountType: "PERCENTAGE",
    discountValue: 15,
  });
  assert(!badCreate.success, "createCouponAction blocked creation of guessable 'DIWALI15' code");

  // -------------------------------------------------------------------------
  // TEST C — Single-Use Private Coupon & Second Attempt Rejection
  // -------------------------------------------------------------------------
  console.log("\n▶ Test C: Single-Use Private Coupon & Second Redemption Rejection");
  const privGenRes = await generatePrivateCouponAction({
    description: "Audit Test Single-Use VIP Credit",
    discountType: "FIXED",
    discountValue: 25000, // ₹250
    minOrderValuePaise: 100000, // ₹1,000
    isSingleUse: true,
    canStackWithCampaigns: true,
    internalReason: "Security regression verification",
  });

  assert(privGenRes.success === true, "generatePrivateCouponAction succeeded");
  const testSingleCode = privGenRes.generatedCode!;
  const testCouponId = privGenRes.id!;
  console.log(`  Generated test code: ${testSingleCode}`);

  // First validation (must succeed)
  const val1 = await validateCouponCode(testSingleCode, 150000, { ipAddress: "test_c_ip_1" });
  assert(val1.success, "First validation of single-use coupon succeeded");
  assert(val1.discountPaise === 25000, "Discount is exactly ₹250 (25,000 paise)");

  // First redemption claim (must succeed)
  const fakeOrderId1 = `ord_test_${Date.now()}_1`;
  const claim1 = await claimCouponRedemption({
    couponId: testCouponId,
    orderId: fakeOrderId1,
    discountPaise: 25000,
  });
  assert(claim1.success, "First atomic redemption claim succeeded");

  // Verify usage_count in database is 1
  const [dbCouponAfter1] = await db.select().from(coupons).where(eq(coupons.id, testCouponId));
  assert(dbCouponAfter1.usageCount === 1, "Database usageCount updated to 1");

  // Second validation attempt (must fail)
  const val2 = await validateCouponCode(testSingleCode, 150000, { ipAddress: "test_c_ip_2" });
  assert(!val2.success, `Second validation rejected: "${val2.error}"`);

  // Second redemption claim attempt (must fail atomically)
  const fakeOrderId2 = `ord_test_${Date.now()}_2`;
  const claim2 = await claimCouponRedemption({
    couponId: testCouponId,
    orderId: fakeOrderId2,
    discountPaise: 25000,
  });
  assert(!claim2.success, `Second atomic claim rejected: "${claim2.error}"`);

  // -------------------------------------------------------------------------
  // TEST D — Concurrent Redemption Race Condition Defense
  // -------------------------------------------------------------------------
  console.log("\n▶ Test D: Concurrent Redemption Race Condition Defense");
  const privGenRes2 = await generatePrivateCouponAction({
    description: "Audit Test Concurrency Race Guard",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderValuePaise: 50000,
    isSingleUse: true,
    internalReason: "Concurrent race condition test",
  });
  const concurrentCouponId = privGenRes2.id!;

  // Simulate 5 simultaneous concurrent checkout requests hitting the database
  const concurrentClaims = await Promise.all([
    claimCouponRedemption({ couponId: concurrentCouponId, orderId: `ord_race_1`, discountPaise: 20000 }),
    claimCouponRedemption({ couponId: concurrentCouponId, orderId: `ord_race_2`, discountPaise: 20000 }),
    claimCouponRedemption({ couponId: concurrentCouponId, orderId: `ord_race_3`, discountPaise: 20000 }),
    claimCouponRedemption({ couponId: concurrentCouponId, orderId: `ord_race_4`, discountPaise: 20000 }),
    claimCouponRedemption({ couponId: concurrentCouponId, orderId: `ord_race_5`, discountPaise: 20000 }),
  ]);

  const successfulClaims = concurrentClaims.filter((r) => r.success);
  const rejectedClaims = concurrentClaims.filter((r) => !r.success);

  assert(
    successfulClaims.length === 1,
    `Exactly 1 of 5 concurrent redemptions succeeded (got ${successfulClaims.length})`
  );
  assert(
    rejectedClaims.length === 4,
    `Remaining 4 concurrent attempts were atomically blocked (got ${rejectedClaims.length})`
  );

  const [dbCouponAfterRace] = await db.select().from(coupons).where(eq(coupons.id, concurrentCouponId));
  assert(dbCouponAfterRace.usageCount === 1, "Final database usageCount is strictly 1 (no overselling)");

  // -------------------------------------------------------------------------
  // TEST E — Revocation and Expiration Enforcement
  // -------------------------------------------------------------------------
  console.log("\n▶ Test E: Expiry and Revocation Enforcement");
  const privGenRes3 = await generatePrivateCouponAction({
    description: "Audit Test Revocation Target",
    discountType: "FIXED",
    discountValue: 10000,
    minOrderValuePaise: 50000,
    isSingleUse: true,
    internalReason: "Revocation verification test",
  });
  const revokeTargetId = privGenRes3.id!;
  const revokeTargetCode = privGenRes3.generatedCode!;

  // Revoke via server action
  const revokeRes = await revokeCouponAction(revokeTargetId, "Test audit revocation");
  assert(revokeRes.success, "revokeCouponAction succeeded");

  // Validate revoked coupon
  const valRevoked = await validateCouponCode(revokeTargetCode, 100000, { ipAddress: "test_e_ip" });
  assert(!valRevoked.success, `Revoked coupon rejected by server: "${valRevoked.error}"`);

  // -------------------------------------------------------------------------
  // TEST F — Customer Account & Email Binding Enforcement
  // -------------------------------------------------------------------------
  console.log("\n▶ Test F: Customer Account & Email Binding Enforcement");
  const targetEmail = "vip.patron@reshamchikankari.com";
  const privGenRes4 = await generatePrivateCouponAction({
    description: "Audit Test Customer Bound Code",
    discountType: "PERCENTAGE",
    discountValue: 25,
    minOrderValuePaise: 50000,
    isSingleUse: true,
    assignedEmail: targetEmail,
    canStackWithCampaigns: true,
    internalReason: "Customer binding audit test",
  });
  const boundCode = privGenRes4.generatedCode!;

  // Attempt redemption with wrong email (must fail)
  const wrongEmailVal = await validateCouponCode(boundCode, 100000, {
    email: "unauthorized.user@domain.com",
    ipAddress: "test_f_wrong_ip",
  });
  assert(!wrongEmailVal.success, `Unauthorized email rejected: "${wrongEmailVal.error}"`);

  // Attempt redemption with correct bound email (must succeed)
  const correctEmailVal = await validateCouponCode(boundCode, 100000, {
    email: targetEmail,
    ipAddress: "test_f_correct_ip",
  });
  assert(correctEmailVal.success, "Authorized bound email successfully redeemed coupon");

  // -------------------------------------------------------------------------
  // TEST G — Authoritative Server-Side Pricing (No Client Manipulation)
  // -------------------------------------------------------------------------
  console.log("\n▶ Test G: Authoritative Server-Side Pricing (Tamper Resistance)");
  const pricingCheck = calculateOrderPricing({
    items: [
      { productId: "prod_001", canonicalPricePaise: 269500, quantity: 1 }, // ₹2,695
    ],
    coupon: { code: "WELCOME10", discountPaise: 21560 }, // ₹215.60
    paymentMethod: "COD",
    forceCampaignActive: true, // Navratri 20%
  });

  assert(pricingCheck.canonicalSubtotalPaise === 269500, "Canonical subtotal is ₹2,695 (269,500 paise)");
  assert(pricingCheck.navratriDiscountPaise === 53900, "Navratri 20% discount is ₹539 (53,900 paise)");
  assert(pricingCheck.discountedSubtotalPaise === 215600, "Discounted subtotal is ₹2,156 (215,600 paise)");
  assert(pricingCheck.couponDiscountPaise === 21560, "Welcome 10% on discounted subtotal is ₹215.60 (21,560 paise)");
  assert(pricingCheck.codFeePaise === 5000, "COD fee is strictly ₹50 (5,000 paise)");
  assert(
    pricingCheck.finalPayablePaise === 215600 - 21560 + 5000,
    `Final total is authoritatively ₹1,990.40 (${pricingCheck.finalPayablePaise} paise)`
  );

  // -------------------------------------------------------------------------
  // TEST H — Stacking Protection (Campaign Incompatible Private Coupons)
  // -------------------------------------------------------------------------
  console.log("\n▶ Test H: Promotional Stacking Abuse Protection");
  const privGenRes5 = await generatePrivateCouponAction({
    description: "Audit Test Exclusive No-Stack Code",
    discountType: "PERCENTAGE",
    discountValue: 30,
    minOrderValuePaise: 50000,
    canStackWithCampaigns: false, // NO STACKING
    internalReason: "Stacking protection test",
  });
  const noStackCode = privGenRes5.generatedCode!;

  // Validate while Navratri is active
  const stackVal = await validateCouponCode(noStackCode, 100000, { ipAddress: "test_h_ip" });
  assert(
    !stackVal.success,
    `Non-stacking coupon correctly rejected while promotional sale is active: "${stackVal.error}"`
  );

  // -------------------------------------------------------------------------
  // TEST I — COD Handling Fee & Razorpay Integer Arithmetic
  // -------------------------------------------------------------------------
  console.log("\n▶ Test I: COD ₹50 Fee & Razorpay Integer Precision");
  const codPricing = calculateOrderPricing({
    items: [{ productId: "p1", canonicalPricePaise: 200000, quantity: 1 }],
    paymentMethod: "COD",
  });
  assert(codPricing.codFeePaise === 5000, "COD fee is strictly ₹50 (5000 paise)");

  const onlinePricing = calculateOrderPricing({
    items: [{ productId: "p1", canonicalPricePaise: 200000, quantity: 1 }],
    paymentMethod: "ONLINE",
  });
  assert(onlinePricing.codFeePaise === 0, "Online Razorpay COD fee is strictly ₹0 (0 paise)");

  // -------------------------------------------------------------------------
  // TEST J — Rate Limiting on Brute-Force Attempts
  // -------------------------------------------------------------------------
  console.log("\n▶ Test J: Rate Limiting & Abuse Prevention");
  const testIp = `test_ip_${Date.now()}`;
  let rateLimitHit = false;

  for (let attempt = 1; attempt <= 12; attempt++) {
    const res = await checkRateLimit(`ip:${testIp}`, "coupon_validate", {
      maxHits: 5,
      windowSeconds: 60,
      blockDurationSeconds: 120,
    });
    if (!res.allowed) {
      rateLimitHit = true;
      assert(
        res.retryAfterSeconds! > 0,
        `Rate limiter engaged on attempt ${attempt}: blocked for ${res.retryAfterSeconds}s`
      );
      break;
    }
  }
  assert(rateLimitHit, "Abusive brute-force submission was successfully throttled");

  // -------------------------------------------------------------------------
  // TEST K — Legacy WELCOME10 System Coupon Integrity
  // -------------------------------------------------------------------------
  console.log("\n▶ Test K: Legacy WELCOME10 System Coupon Integrity");
  const welcomeCheck = await validateCouponCode("WELCOME10", 150000, { ipAddress: "test_k_ip" });
  assert(welcomeCheck.success, "WELCOME10 remains fully functional for eligible first-time patrons");
  assert(welcomeCheck.discountPaise === 15000, "WELCOME10 computes 10% discount correctly");

  // Attempt to delete WELCOME10 (must be blocked)
  const [welcomeRow] = await db.select().from(coupons).where(eq(coupons.code, "WELCOME10"));
  if (welcomeRow) {
    const delRes = await revokeCouponAction(welcomeRow.id);
    assert(!delRes.success, "Revocation of core system WELCOME10 is safely blocked");
  }

  // -------------------------------------------------------------------------
  // Clean up temporary test coupons
  // -------------------------------------------------------------------------
  const testIds: string[] = [testCouponId, concurrentCouponId, revokeTargetId, privGenRes4.id, privGenRes5.id].filter(
    (x): x is string => typeof x === "string"
  );
  for (const tid of testIds) {
    await db.delete(coupons).where(eq(coupons.id, tid)).catch(() => {});
  }

  console.log("\n================================================================================");
  console.log(`COUPON SECURITY SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runCouponSecurityTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
