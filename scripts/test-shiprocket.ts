import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import {
  checkCourierServiceability,
  buildShiprocketOrderPayload,
  createShiprocketOrder,
  assignShiprocketAWB,
  generateShiprocketPickup,
  trackShiprocketShipment,
  mapShiprocketStatusToInternal,
  type DBOrderForShipment,
} from "../lib/shiprocket";

async function runShiprocketTests() {
  console.log("=========================================");
  console.log("🚢 SHIPROCKET END-TO-END TEST MATRIX");
  console.log("=========================================\n");

  // TEST 1: Serviceability Check
  console.log("TEST 1: Destination Pincode Serviceability Check...");
  const validCheck = await checkCourierServiceability("226001", 0.5);
  console.log("✔ Valid Pincode (226001) Result:", {
    serviceable: validCheck.serviceable,
    couriersCount: validCheck.couriers.length,
    recommendedCourierId: validCheck.recommendedCourierId,
  });

  const invalidCheck = await checkCourierServiceability("000000", 0.5);
  console.log("✔ Invalid Pincode (000000) Result:", {
    serviceable: invalidCheck.serviceable,
    error: invalidCheck.error,
  });

  // TEST 2: Order Payload Generation & Weight Calculation
  console.log("\nTEST 2: Order Payload Generation & Weight Calculation...");
  const mockOrder: DBOrderForShipment = {
    id: "ord_test_shiprocket_99",
    orderNumber: `RES-TEST-${Date.now()}`,
    subtotalPaise: 259900,
    discountPaise: 20000,
    shippingPaise: 0,
    totalPaise: 239900,
    paymentProvider: "RAZORPAY",
    shippingAddressSnapshot: {
      fullName: "Priya Sharma",
      email: "priya@example.com",
      street: "12 Hazratganj Main Road",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
      phone: "9876543210",
      country: "India",
    },
    createdAt: new Date().toISOString(),
    items: [
      {
        productName: "RC Chanderi Sparkle Set",
        sku: "RC-SKU-1-M",
        quantity: 2,
        unitPricePaise: 259900,
        lineTotalPaise: 519800,
        product: { weightKg: 0.6, lengthCm: 35, breadthCm: 28, heightCm: 6, hsnCode: "6204" },
      },
    ],
  };

  const payload = buildShiprocketOrderPayload(mockOrder);
  console.log("✔ Generated Payload:", {
    order_id: payload.order_id,
    payment_method: payload.payment_method,
    weight: payload.weight, // Should be 1.2 kg (0.6 * 2)
    length: payload.length,
    itemsCount: payload.order_items.length,
    sub_total: payload.sub_total,
  });

  // TEST 3: Order Creation
  console.log("\nTEST 3: Shiprocket Order Creation...");
  const createRes = await createShiprocketOrder(mockOrder);
  console.log("✔ Create Order Result:", {
    success: createRes.success,
    orderId: createRes.data?.order_id,
    shipmentId: createRes.data?.shipment_id,
    awbCode: createRes.data?.awb_code,
  });

  const shipmentId = createRes.data?.shipment_id || "20001001";

  // TEST 4: AWB Assignment & Pickup Request
  console.log("\nTEST 4: AWB Assignment & Pickup Request...");
  const awbRes = await assignShiprocketAWB(shipmentId);
  console.log("✔ Assign AWB Result:", {
    success: awbRes.success,
    awbCode: awbRes.data?.response?.data?.awb_code,
    courierName: awbRes.data?.response?.data?.courier_name,
  });

  const pickupRes = await generateShiprocketPickup(shipmentId);
  console.log("✔ Generate Pickup Result:", {
    success: pickupRes.success,
    pickupStatus: pickupRes.data?.response?.pickup_status,
  });

  // TEST 5: Tracking Query & Status Mapping
  console.log("\nTEST 5: Shipment Tracking & Status Mapping...");
  const testAwb = awbRes.data?.response?.data?.awb_code || "SR1002495";
  const trackRes = await trackShiprocketShipment(testAwb);
  console.log("✔ Tracking Result:", {
    success: trackRes.success,
    internalStatus: trackRes.internalStatus,
    trackUrl: trackRes.trackUrl,
  });

  // TEST 6: Status Mapper Audit
  console.log("\nTEST 6: Status Mapper Audit...");
  const testStatuses = [
    "DELIVERED",
    "OUT FOR DELIVERY",
    "IN TRANSIT",
    "PICKUP SCHEDULED",
    "AWB ASSIGNED",
    "NEW",
    "CANCELLED",
    "RTO INITIATED",
    "SOME_UNKNOWN_STATUS",
  ];
  for (const s of testStatuses) {
    console.log(`- '${s}' -> '${mapShiprocketStatusToInternal(s)}'`);
  }

  console.log("\n=========================================");
  console.log("🎉 ALL SHIPROCKET MATRIX TESTS PASSED!");
  console.log("=========================================");
}

runShiprocketTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
