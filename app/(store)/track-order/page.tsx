import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import { db } from "@/db";
import { orders, shipmentTrackingEvents, orderTimeline } from "@/db/schema/order";
import { eq, or, desc } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/utils";
import { Package, Truck, Search, ArrowLeft, CheckCircle2, Clock, AlertCircle, ExternalLink, MapPin } from "lucide-react";

interface TrackOrderPageProps {
  searchParams: Promise<{ orderNumber?: string; contact?: string }>;
}

export const metadata = {
  title: "Track Your Order — Resham Chikankari",
  description: "Track the real-time shipping and delivery status of your Lucknowi Chikankari order.",
};

export default async function TrackOrderPage(props: TrackOrderPageProps) {
  const searchParams = await props.searchParams;
  const orderNumberQuery = (searchParams.orderNumber || "").trim();
  const contactQuery = (searchParams.contact || "").trim().toLowerCase();

  let orderData: any = null;
  let searchError: string | null = null;

  if (orderNumberQuery && isDatabaseConfigured()) {
    try {
      const [order] = await db
        .select()
        .from(orders)
        .where(or(eq(orders.orderNumber, orderNumberQuery), eq(orders.id, orderNumberQuery)))
        .limit(1);

      if (!order) {
        searchError = "No order found matching the provided order number.";
      } else {
        const snap = (order.shippingAddressSnapshot as any) || {};
        const snapEmail = (snap.email || "").toLowerCase();
        const snapPhone = (snap.phone || "").replace(/\D/g, "");
        const queryDigits = contactQuery.replace(/\D/g, "");

        // If contact verification is provided, ensure it matches
        if (contactQuery) {
          const emailMatches = contactQuery.includes("@") && (snapEmail === contactQuery);
          const phoneMatches = queryDigits.length >= 10 && snapPhone.endsWith(queryDigits.slice(-10));

          if (!emailMatches && !phoneMatches) {
            searchError = "The contact details do not match this order. Please verify your email or mobile number.";
          } else {
            orderData = order;
          }
        } else {
          // If came directly from order confirmation link, allow preview
          orderData = order;
        }

        if (orderData) {
          // Auto-sync live AWB if Shiprocket order exists
          if (orderData.shiprocketOrderId && !orderData.awbCode) {
            try {
              const { syncOrderTrackingAction } = await import("@/actions/shiprocket");
              await syncOrderTrackingAction(orderData.id);
            } catch {}
          }
        }
      }
    } catch (err: any) {
      console.error("Error looking up order tracking:", err);
      searchError = "Failed to look up order tracking. Please try again later.";
    }
  }

  const shipping = (orderData?.shippingAddressSnapshot as any) || {};

  return (
    <div className="bg-[#FFF9F4] min-h-screen text-[#161616] py-12 sm:py-20 font-sans selection:bg-[#E694AA]/20">
      <Container className="max-w-2xl">
        {/* Header Breadcrumb */}
        <div className="mb-8 flex items-center justify-between border-b border-brand-black/10 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-neutral-600 hover:text-[#7C7A5A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C7A5A]">
            Shipment Tracker
          </span>
        </div>

        {/* Page Title */}
        <div className="text-center mb-10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#E694AA] block">
            LIVE DISPATCH &amp; DELIVERY
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-[#161616]">
            Track Your Order
          </h1>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Enter your order number to view real-time courier updates, dispatch status, and expected delivery.
          </p>
        </div>

        {/* Search Form */}
        <form className="bg-white border border-brand-black/10 p-6 sm:p-8 rounded-2xl shadow-xs space-y-4 mb-8">
          <div className="space-y-1.5">
            <label htmlFor="orderNumber" className="uppercase tracking-widest text-[10px] font-extrabold text-neutral-800 block">
              Order Number *
            </label>
            <input
              id="orderNumber"
              name="orderNumber"
              type="text"
              required
              defaultValue={orderNumberQuery}
              placeholder="e.g. RES-1790255825306-8124"
              className="w-full px-4 py-3 bg-[#FFF9F4] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#7C7A5A] font-mono text-sm uppercase font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact" className="uppercase tracking-widest text-[10px] font-extrabold text-neutral-800 block">
              Email or 10-Digit Mobile (for Verification)
            </label>
            <input
              id="contact"
              name="contact"
              type="text"
              defaultValue={contactQuery}
              placeholder="e.g. name@example.com or 9876543210"
              className="w-full px-4 py-3 bg-[#FFF9F4] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#7C7A5A] text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brand-black hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Search className="w-4 h-4" /> Track Order Status
          </button>
        </form>

        {searchError && (
          <div className="p-4 bg-[#E694AA]/10 border border-[#E694AA]/30 text-[#161616] text-xs font-sans rounded-xl flex items-start gap-2.5 mb-8">
            <AlertCircle className="w-4 h-4 text-[#E694AA] shrink-0 mt-0.5" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Order Tracking Result Card */}
        {orderData && (
          <div className="bg-white border border-brand-black/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-neutral-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">
                  ORDER NUMBER
                </span>
                <span className="font-mono text-sm font-bold text-neutral-900">
                  {orderData.orderNumber}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">
                  STATUS
                </span>
                <span className="inline-block px-3 py-1 bg-[#7C7A5A]/10 text-[#7C7A5A] text-[10px] uppercase font-bold rounded-full border border-[#7C7A5A]/20">
                  {orderData.status} ({orderData.fulfillmentStatus || "CONFIRMED"})
                </span>
              </div>
            </div>

            {/* Courier & AWB Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 bg-[#FFF9F4] rounded-xl border border-neutral-200/60 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">
                  COURIER PARTNER
                </span>
                <p className="font-bold text-neutral-800">
                  {orderData.courierName || "Express Handcrafted Delivery (Shiprocket)"}
                </p>
                {orderData.awbCode && (
                  <p className="font-mono text-[11px] text-neutral-600">
                    AWB: {orderData.awbCode}
                  </p>
                )}
              </div>

              <div className="p-4 bg-[#FFF9F4] rounded-xl border border-neutral-200/60 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">
                  PAYMENT
                </span>
                <p className="font-bold text-neutral-800">
                  {orderData.paymentProvider || "ONLINE"} ({orderData.paymentStatus})
                </p>
                <p className="text-[11px] text-neutral-500">
                  Total: ₹{(orderData.totalPaise / 100).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Destination Address */}
            {shipping.street && (
              <div className="p-4 bg-neutral-50 rounded-xl text-xs space-y-1 text-neutral-600">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#7C7A5A]" />
                  <span>Delivery Destination</span>
                </div>
                <p className="pl-5 leading-relaxed">
                  {shipping.fullName}<br />
                  {shipping.street}, {shipping.city}, {shipping.state} - {shipping.zip}
                </p>
              </div>
            )}

            {/* Live External Tracking Link */}
            {orderData.trackingUrl && (
              <div className="pt-2">
                <a
                  href={orderData.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#7C7A5A] hover:bg-[#656347] text-white text-xs uppercase tracking-widest font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  View Live Tracking on Courier Portal <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
