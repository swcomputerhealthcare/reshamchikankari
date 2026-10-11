import { config } from "dotenv";
config();

import { db } from "@/db";
import { products, productVariants } from "@/db/schema/catalog";
import { coupons } from "@/db/schema/coupon";
import { orders } from "@/db/schema/order";
import {
  calculateProductPrice,
  calculateOrderPricing,
  setNavratriCampaignActive,
  isNavratriPromotionActive,
  NAVRATRI_CAMPAIGN,
  formatPaiseToRupees,
} from "@/lib/promotions";
import { validateCouponCode } from "@/lib/coupon";
import { buildShiprocketOrderPayload, DBOrderForShipment } from "@/lib/shiprocket/orders";
import { eq } from "drizzle-orm";

const EXPECTED_22_PRODUCTS = [
  { name: "CHANDERI SPARKLE SET DYED", baseRupees: 2695, expectedSaleRupees: 2156 },
  { name: "COTTON CARGO SET DYED", baseRupees: 2175, expectedSaleRupees: 1740 },
  { name: "CHANDERI SHORT DYED", baseRupees: 1595, expectedSaleRupees: 1276 },
  { name: "MUSLINE CORD SET DYED", baseRupees: 2495, expectedSaleRupees: 1996 },
  { name: "DOLBY ANGRAKHA DYED", baseRupees: 2250, expectedSaleRupees: 1800 },
  { name: "COTTON SET DYED", baseRupees: 1995, expectedSaleRupees: 1596 },
  { name: "MUSLINE MK 3 PCS SET DYED", baseRupees: 3895, expectedSaleRupees: 3116 },
  { name: "DOLBY KURTI DYED", baseRupees: 1495, expectedSaleRupees: 1196 },
  { name: "RAYON SET DYED", baseRupees: 2195, expectedSaleRupees: 1756 },
  { name: "VISCOSE SPAGHETTI SET DYED", baseRupees: 5695, expectedSaleRupees: 4556 },
  { name: "RAYON HIGHLIGHT SET DYED", baseRupees: 2175, expectedSaleRupees: 1740 },
  { name: "RAYON HIGHLIGHT SET WHITE", baseRupees: 1995, expectedSaleRupees: 1596 },
  { name: "MODAL FLOWER LONG", baseRupees: 1795, expectedSaleRupees: 1436 },
  { name: "RAYON PHULKAARI LEHAR KURTI", baseRupees: 1295, expectedSaleRupees: 1036 },
  { name: "COTTON SHORT LITE", baseRupees: 895, expectedSaleRupees: 716 },
  { name: "RAYON SHORT", baseRupees: 1095, expectedSaleRupees: 876 },
  { name: "RAYON KALINI KURTI", baseRupees: 1495, expectedSaleRupees: 1196 },
  { name: "RAYON KALINI DYED", baseRupees: 1675, expectedSaleRupees: 1340 },
  { name: "VISCOSE ROSE MK 4 PCS SET DYED", baseRupees: 6895, expectedSaleRupees: 5516 },
  { name: "VISCOSE ROSE MK 4 PCS SET WHITE", baseRupees: 6395, expectedSaleRupees: 5116 },
  { name: "COTTON FLAIR PLAZZO", baseRupees: 1395, expectedSaleRupees: 1116 },
  { name: "COTTON DYEABLE PLAZZO", baseRupees: 1195, expectedSaleRupees: 956 },
];

async function runNavratriTestSuite() {
  console.log("================================================================================");
  console.log("RESHAM CHIKANKARI — NAVRATRI SALE AUTOMATED REGRESSION SUITE");
  console.log("================================================================================");
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      if (detail) console.error(`         Reason: ${detail}`);
      failedCount++;
    }
  }

  // Ensure campaign is active for tests
  setNavratriCampaignActive(true);

  // ---------------------------------------------------------------------------
  // TEST L: Verification of all 22 products against the checklist table
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test L: Table of 22 Products Verification");
  for (const item of EXPECTED_22_PRODUCTS) {
    const canonicalPaise = item.baseRupees * 100;
    const pricing = calculateProductPrice(canonicalPaise);
    const expectedSalePaise = item.expectedSaleRupees * 100;
    const match = pricing.sellingPricePaise === expectedSalePaise;
    assert(
      match,
      `Product: ${item.name}`,
      `Base ₹${item.baseRupees} -> Expected sale ₹${item.expectedSaleRupees}, Got ₹${pricing.sellingPricePaise / 100}`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST A: Basic Navratri Sale (Single Item, COD & Razorpay)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test A: Basic Navratri Sale Calculation");
  const basePricePaise = 269500; // ₹2,695
  const singleItem = [
    {
      productId: "prod_sparkle",
      canonicalPricePaise: basePricePaise,
      quantity: 1,
    },
  ];

  // With explicit ₹200 shipping as stated in test brief
  const pricingA_Razorpay = calculateOrderPricing({
    items: singleItem,
    coupon: null,
    paymentMethod: "ONLINE",
    shippingPaise: 20000,
  });

  assert(
    pricingA_Razorpay.canonicalSubtotalPaise === 269500,
    "Test A.1: Pre-campaign canonical subtotal is ₹2,695 (269,500 paise)"
  );
  assert(
    pricingA_Razorpay.navratriDiscountPaise === 53900,
    "Test A.2: Navratri 20% discount is ₹539 (53,900 paise)"
  );
  assert(
    pricingA_Razorpay.discountedSubtotalPaise === 215600,
    "Test A.3: Subtotal after Navratri is ₹2,156 (215,600 paise)"
  );
  assert(
    pricingA_Razorpay.finalPayablePaise === 235600,
    "Test A.4: Razorpay payable with ₹200 shipping is ₹2,356 (235,600 paise)"
  );

  const pricingA_COD = calculateOrderPricing({
    items: singleItem,
    coupon: null,
    paymentMethod: "COD",
    shippingPaise: 20000,
  });
  assert(
    pricingA_COD.codFeePaise === 5000,
    "Test A.5: COD fee is exactly ₹50 (5,000 paise)"
  );
  assert(
    pricingA_COD.finalPayablePaise === 240600,
    "Test A.6: COD payable with ₹200 shipping and ₹50 COD fee is ₹2,406 (240,600 paise)"
  );

  // ---------------------------------------------------------------------------
  // TEST B: Sequential Stacking (Navratri 20% + Welcome 10%)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test B: Sequential Stacking of Both Offers");
  // 1. Automatic 20% Navratri discount on ₹2,695 = ₹539 -> Subtotal = ₹2,156
  // 2. Welcome 10% on ₹2,156 = 10% of 215,600 paise = 21,560 paise = ₹215.60
  // 3. Discounted product subtotal = 215,600 - 21,560 = 194,040 paise = ₹1,940.40
  const validationB = await validateCouponCode("WELCOME10", 215600);
  assert(validationB.success, "Test B.1: WELCOME10 coupon is valid on discounted subtotal");
  assert(
    validationB.discountPaise === 21560,
    `Test B.2: WELCOME10 discount is exactly 21,560 paise (₹215.60), got ${validationB.discountPaise}`
  );

  const pricingB_Razorpay = calculateOrderPricing({
    items: singleItem,
    coupon: { code: "WELCOME10", discountPaise: validationB.discountPaise! },
    paymentMethod: "ONLINE",
    shippingPaise: 20000,
  });
  assert(
    pricingB_Razorpay.subtotalAfterDiscountsPaise === 194040,
    `Test B.3: Product amount after both discounts is ₹1,940.40 (194,040 paise), got ${pricingB_Razorpay.subtotalAfterDiscountsPaise}`
  );
  assert(
    pricingB_Razorpay.finalPayablePaise === 214040,
    `Test B.4: Final Razorpay payable is ₹2,140.40 (214,040 paise), got ${pricingB_Razorpay.finalPayablePaise}`
  );

  const pricingB_COD = calculateOrderPricing({
    items: singleItem,
    coupon: { code: "WELCOME10", discountPaise: validationB.discountPaise! },
    paymentMethod: "COD",
    shippingPaise: 20000,
  });
  assert(
    pricingB_COD.finalPayablePaise === 219040,
    `Test B.5: Final COD payable is ₹2,190.40 (219,040 paise), got ${pricingB_COD.finalPayablePaise}`
  );

  // ---------------------------------------------------------------------------
  // TEST C: Welcome Offer Ineligibility for Returning Customers
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test C: Welcome Offer Ineligibility Handling");
  // Check against an existing order customer email/phone that previously redeemed coupon
  const testEmailUsed = "satya@example.com";
  // Validate with returning context
  const validationC = await validateCouponCode("WELCOME10", 215600, {
    email: testEmailUsed,
  });
  // If user has redeemed or not, Navratri discount must still stand:
  const pricingC = calculateOrderPricing({
    items: singleItem,
    coupon: validationC.success ? { code: "WELCOME10", discountPaise: validationC.discountPaise! } : null,
    paymentMethod: "ONLINE",
    shippingPaise: 0,
  });
  assert(
    pricingC.discountedSubtotalPaise === 215600,
    "Test C.1: Navratri 20% discount remains intact even if Welcome offer is rejected"
  );

  // ---------------------------------------------------------------------------
  // TEST D: Multiple Products in Cart
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test D: Multiple Products Cart Calculation");
  const multiItems = [
    { productId: "p1", canonicalPricePaise: 269500, quantity: 1 }, // Sparkle Set: 2695 -> 2156 (discount 539)
    { productId: "p2", canonicalPricePaise: 159500, quantity: 2 }, // Short: 2 * 1595 = 3190 -> 2 * 1276 = 2552 (discount 638)
    { productId: "p3", canonicalPricePaise: 389500, quantity: 1 }, // 3 Pcs Set: 3895 -> 3116 (discount 779)
  ];
  // Expected:
  // Canonical subtotal: 2695 + 3190 + 3895 = 9780 (978,000 paise)
  // Navratri discount: 539 + 638 + 779 = 1956 (195,600 paise)
  // Discounted subtotal: 9780 - 1956 = 7824 (782,400 paise)
  const pricingD = calculateOrderPricing({
    items: multiItems,
    paymentMethod: "ONLINE",
  });
  assert(
    pricingD.canonicalSubtotalPaise === 978000,
    `Test D.1: Canonical subtotal matches sum of line items (₹9,780), got ₹${pricingD.canonicalSubtotalPaise / 100}`
  );
  assert(
    pricingD.navratriDiscountPaise === 195600,
    `Test D.2: Navratri discount matches sum of individual line discounts (₹1,956), got ₹${pricingD.navratriDiscountPaise / 100}`
  );
  assert(
    pricingD.discountedSubtotalPaise === 782400,
    `Test D.3: Discounted subtotal is ₹7,824, got ₹${pricingD.discountedSubtotalPaise / 100}`
  );

  // ---------------------------------------------------------------------------
  // TEST E: Quantity Changes
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test E: Quantity Changes Determinism");
  const qty1Pricing = calculateOrderPricing({
    items: [{ productId: "p1", canonicalPricePaise: 269500, quantity: 1 }],
  });
  const qty3Pricing = calculateOrderPricing({
    items: [{ productId: "p1", canonicalPricePaise: 269500, quantity: 3 }],
  });
  assert(
    qty3Pricing.navratriDiscountPaise === qty1Pricing.navratriDiscountPaise * 3,
    "Test E.1: Quantity increase scales discount linearly (no duplicate compounding)"
  );
  assert(
    qty3Pricing.discountedSubtotalPaise === qty1Pricing.discountedSubtotalPaise * 3,
    "Test E.2: Subtotal scales exactly 3x"
  );

  // ---------------------------------------------------------------------------
  // TEST F: COD / Razorpay Switching Repeatedly
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test F: Repeated Payment Method Switching");
  let pricingF = calculateOrderPricing({ items: singleItem, paymentMethod: "ONLINE" });
  assert(pricingF.codFeePaise === 0, "Test F.1: Razorpay has ₹0 COD surcharge");

  pricingF = calculateOrderPricing({ items: singleItem, paymentMethod: "COD" });
  assert(pricingF.codFeePaise === 5000, "Test F.2: Switch to COD adds exactly ₹50");

  pricingF = calculateOrderPricing({ items: singleItem, paymentMethod: "ONLINE" });
  assert(pricingF.codFeePaise === 0, "Test F.3: Switch back to Razorpay resets COD charge to ₹0");

  pricingF = calculateOrderPricing({ items: singleItem, paymentMethod: "COD" });
  assert(pricingF.codFeePaise === 5000, "Test F.4: Switch to COD again does NOT accumulate fees (still ₹50)");
  assert(
    pricingF.navratriDiscountPaise === 53900,
    "Test F.5: Navratri discount does not multiply during switching"
  );

  // ---------------------------------------------------------------------------
  // TEST G: True Guest Checkout Eligibility
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test G: Guest Checkout Pricing & Validation");
  const guestAddress = {
    email: `guest_${Date.now()}@example.com`,
    phone: "9876543210",
  };
  const guestCouponRes = await validateCouponCode("WELCOME10", 215600, guestAddress);
  assert(guestCouponRes.success, "Test G.1: Guest patron is eligible for WELCOME10 on first order");
  const guestPricing = calculateOrderPricing({
    items: singleItem,
    coupon: { code: "WELCOME10", discountPaise: guestCouponRes.discountPaise! },
    paymentMethod: "ONLINE",
  });
  assert(
    guestPricing.finalPayablePaise === 194040,
    "Test G.2: Guest order receives exact stacked discount without requiring an account"
  );

  // ---------------------------------------------------------------------------
  // TEST H: Coupon Abuse & Edge Cases
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test H: Coupon Abuse Validation");
  const fakeCoupon = await validateCouponCode("NON_EXISTENT_COUPON", 215600);
  assert(!fakeCoupon.success, "Test H.1: Non-existent coupon is rejected");

  const minOrderFail = await validateCouponCode("WELCOME10", 50000); // Only ₹500, below ₹1000 min
  assert(!minOrderFail.success, "Test H.2: Coupon rejected when subtotal is below minimum order value");

  // ---------------------------------------------------------------------------
  // TEST I: Payment Security & Integer Paise Integrity
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test I: Payment Security & Integer Arithmetic");
  assert(
    Number.isInteger(pricingB_Razorpay.finalPayablePaise),
    "Test I.1: Final Razorpay amount is an integer number of paise"
  );
  assert(
    pricingB_Razorpay.finalPayablePaise > 0,
    "Test I.2: Final payable amount is positive"
  );

  // ---------------------------------------------------------------------------
  // TEST J: Shiprocket Payload Integrity
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test J: Shiprocket Order Payload Verification");
  const mockDBOrder: DBOrderForShipment = {
    id: "ord_test_sr",
    orderNumber: "RES-TEST-001",
    subtotalPaise: 215600, // discounted Navratri subtotal
    discountPaise: 21560, // Welcome coupon
    shippingPaise: 0,
    totalPaise: 244040,
    paymentProvider: "COD",
    shippingAddressSnapshot: {
      fullName: "Ananya Sharma",
      street: "Civil Lines, Near High Court",
      city: "Lucknow",
      state: "Uttar Pradesh",
      zip: "226001",
      phone: "9876543210",
      email: "ananya@example.com",
      codFeePaise: 5000,
    },
    createdAt: new Date(),
    items: [
      {
        productName: "CHANDERI SPARKLE SET DYED",
        sku: "RC-CSP-01",
        quantity: 1,
        unitPricePaise: 215600,
        lineTotalPaise: 215600,
      },
    ],
  };

  const srPayload = buildShiprocketOrderPayload(mockDBOrder);
  assert(
    srPayload.payment_method === "COD",
    "Test J.1: Shiprocket payment method set to COD"
  );
  assert(
    srPayload.transaction_charges === 50,
    `Test J.2: Shiprocket COD transaction charge is ₹50, got ₹${srPayload.transaction_charges}`
  );
  assert(
    srPayload.sub_total === 2156,
    `Test J.3: Shiprocket sub_total matches discounted item price (₹2,156), got ₹${srPayload.sub_total}`
  );
  assert(
    srPayload.total_discount === 216,
    `Test J.4: Shiprocket total_discount rounds to ₹216, got ₹${srPayload.total_discount}`
  );
  const srCollectableRupees =
    srPayload.sub_total +
    (srPayload.transaction_charges || 0) +
    (srPayload.shipping_charges || 0) -
    (srPayload.total_discount || 0);
  assert(
    srCollectableRupees === 1990,
    `Test J.5: Shiprocket collectable amount on COD is exact (2156 + 50 - 216 = ₹1,990), got ₹${srCollectableRupees}`
  );

  // ---------------------------------------------------------------------------
  // TEST K: Campaign Deactivation
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test K: Campaign Deactivation Behavior");
  setNavratriCampaignActive(false);
  const inactiveProductPricing = calculateProductPrice(basePricePaise);
  assert(
    inactiveProductPricing.sellingPricePaise === basePricePaise,
    "Test K.1: Deactivating campaign restores canonical product price ₹2,695"
  );
  assert(
    inactiveProductPricing.navratriDiscountPaise === 0,
    "Test K.2: Navratri discount is ₹0 when inactive"
  );
  assert(
    !inactiveProductPricing.isNavratriActive,
    "Test K.3: isNavratriActive flag is false when inactive"
  );

  // Restore active campaign for production
  setNavratriCampaignActive(true);

  // ---------------------------------------------------------------------------
  // DATABASE INTEGRITY CHECK: Canonical baseline prices unchanged in DB
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Database Baseline Integrity Check");
  const dbProducts = await db.select({ id: products.id, name: products.name, pricePaise: products.pricePaise }).from(products);
  assert(
    dbProducts.length >= 22,
    `Found ${dbProducts.length} active products in database`
  );
  const sparkleDb = dbProducts.find((p) => p.name.includes("Chanderi Sparkle") || p.name.includes("SPARKLE"));
  if (sparkleDb) {
    assert(
      sparkleDb.pricePaise === 269500,
      `Database canonical price for Chanderi Sparkle is preserved at ₹2,695 (269,500 paise), got ${sparkleDb.pricePaise}`
    );
  }

  console.log("\n================================================================================");
  console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("================================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runNavratriTestSuite().catch((err) => {
  console.error("Test suite runtime failure:", err);
  process.exit(1);
});
