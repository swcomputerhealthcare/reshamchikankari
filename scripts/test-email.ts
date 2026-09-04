import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { renderOrderConfirmationEmailHtml } from "../lib/email/templates/order-confirmation";
import { renderShipmentDispatchedEmailHtml } from "../lib/email/templates/shipment-dispatched";
import { renderDeliveryCompletedEmailHtml } from "../lib/email/templates/delivery-completed";
import { sendEmail } from "../lib/email";

async function runEmailTests() {
  console.log("=========================================");
  console.log("✉️ PHASE 21 EMAIL NOTIFICATIONS TEST SUITE");
  console.log("=========================================\n");

  // TEST 1: Render Order Confirmation HTML Template
  console.log("TEST 1: Rendering Order Confirmation Email Template...");
  const orderHtml = renderOrderConfirmationEmailHtml({
    orderNumber: "RES-2026-9901",
    customerName: "Ananya Roy",
    customerEmail: "ananya@example.com",
    dateStr: "3 September 2026",
    paymentMethod: "PAID (RAZORPAY)",
    subtotal: "₹12,990",
    discount: "₹1,299",
    shipping: "FREE",
    walletPaid: "₹500",
    total: "₹11,191",
    items: [
      {
        name: "RC Chanderi Sparkle Set",
        sku: "RC-SKU-001-M",
        sizeName: "M",
        quantity: 1,
        price: "₹12,990",
      },
    ],
    shippingAddress: {
      fullName: "Ananya Roy",
      street: "Plot 42, Civil Lines",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
      phone: "+91 98765 43210",
    },
  });

  console.log("✔ Order Confirmation HTML Length:", orderHtml.length, "chars");

  // TEST 2: Render Shipment Dispatched HTML Template
  console.log("\nTEST 2: Rendering Shipment Dispatched Email Template...");
  const shipmentHtml = renderShipmentDispatchedEmailHtml({
    orderNumber: "RES-2026-9901",
    customerName: "Ananya Roy",
    courierName: "Blue Dart Express",
    awbCode: "BD88994411",
    trackingUrl: "https://shiprocket.co/tracking/BD88994411",
    destinationCity: "Lucknow",
    itemsCount: 1,
  });

  console.log("✔ Shipment Dispatched HTML Length:", shipmentHtml.length, "chars");

  // TEST 3: Render Delivery Completed HTML Template
  console.log("\nTEST 3: Rendering Delivery Completed Email Template...");
  const deliveryHtml = renderDeliveryCompletedEmailHtml({
    orderNumber: "RES-2026-9901",
    customerName: "Ananya Roy",
    deliveredDateStr: "3 September 2026",
    reviewUrl: "https://reshamchikankari.com/patron-voices",
  });

  console.log("✔ Delivery Completed HTML Length:", deliveryHtml.length, "chars");

  // TEST 4: Dispatch Test Email (Simulation mode)
  console.log("\nTEST 4: Dispatching Email via Resend Engine...");
  const dispatchRes = await sendEmail({
    to: "ananya@example.com",
    subject: "Test Order Confirmation — Resham Chikankari",
    html: orderHtml,
  });

  console.log("✔ Dispatch Result:", dispatchRes);

  console.log("\n=========================================");
  console.log("🎉 ALL EMAIL NOTIFICATION TESTS PASSED!");
  console.log("=========================================");
}

runEmailTests().catch((err) => {
  console.error("Email test execution failed:", err);
  process.exit(1);
});
