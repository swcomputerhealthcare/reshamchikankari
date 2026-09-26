import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import AnimatedTicket from "@/components/checkout/animated-ticket";
import OrderSuccessTracker from "@/components/analytics/OrderSuccessTracker";
import { db } from "@/db";
import { orders } from "@/db/schema/order";
import { eq } from "drizzle-orm";
import { ShoppingBag, History, MapPin, Truck, ExternalLink, CheckCircle2, Phone, Mail } from "lucide-react";

interface SuccessPageProps {
  searchParams: Promise<{ orderNumber?: string; pm?: string; total?: string; name?: string }>;
}

export const metadata = {
  title: "Order Placed Successfully — Resham Chikankari",
  description: "Your handcrafted Lucknowi Chikankari order confirmation and receipt.",
};

export default async function CheckoutSuccessPage(props: SuccessPageProps) {
  const searchParams = await props.searchParams;
  const orderRef = searchParams.orderNumber || "RES-UNKNOWN";
  const pmQuery = searchParams.pm || "COD";
  const nameQuery = searchParams.name ? decodeURIComponent(searchParams.name) : "Valued Patron";
  const totalQuery = searchParams.total ? parseInt(searchParams.total, 10) : 0;

  const isDbAvailable = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");

  let orderData = {
    orderNumber: orderRef,
    totalPaise: totalQuery || 0,
    customerName: nameQuery,
    paymentProvider: pmQuery,
    paymentStatus: pmQuery === "COD" ? "PENDING (COD)" : "PAID",
    paymentId: null as string | null,
    date: new Date(),
    orderId: orderRef,
    shippingAddress: null as {
      fullName: string;
      phone: string;
      email: string;
      street: string;
      city: string;
      state: string;
      zip: string;
    } | null,
    fulfillmentStatus: "CONFIRMED",
    awbCode: null as string | null,
    courierName: null as string | null,
    trackingUrl: null as string | null,
  };

  if (isDbAvailable) {
    try {
      const [dbOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderRef))
        .limit(1);

      const targetOrder = dbOrder || (await db.select().from(orders).where(eq(orders.id, orderRef)).limit(1))[0];

      if (targetOrder) {
        const address = (targetOrder.shippingAddressSnapshot as any) || {};
        orderData = {
          orderNumber: targetOrder.orderNumber,
          totalPaise: targetOrder.totalPaise,
          customerName: address?.fullName || address?.name || nameQuery,
          paymentProvider: targetOrder.paymentProvider || address?.paymentMethod || pmQuery,
          paymentStatus: targetOrder.paymentStatus === "PAID" ? "PAID" : (targetOrder.paymentProvider === "COD" ? "PENDING (COD)" : targetOrder.paymentStatus),
          paymentId: targetOrder.paymentId,
          date: targetOrder.createdAt ? new Date(targetOrder.createdAt) : new Date(),
          orderId: targetOrder.id,
          shippingAddress: {
            fullName: address?.fullName || nameQuery,
            phone: address?.phone || "",
            email: address?.email || "",
            street: address?.street || "",
            city: address?.city || "",
            state: address?.state || "",
            zip: address?.zip || "",
          },
          fulfillmentStatus: targetOrder.fulfillmentStatus || "CONFIRMED",
          awbCode: targetOrder.awbCode || null,
          courierName: targetOrder.courierName || null,
          trackingUrl: targetOrder.trackingUrl || null,
        };
      }
    } catch (err) {
      console.error("Failed to query order details for success receipt page:", err);
    }
  }

  return (
    <div className="bg-[#FFF9F4] min-h-screen text-[#161616] py-12 sm:py-20 select-none font-sans">
      <OrderSuccessTracker
        orderNumber={orderData.orderNumber}
        totalPaise={orderData.totalPaise}
      />
      <Container className="max-w-2xl flex flex-col items-center justify-center text-center space-y-8">
        
        {/* Animated Ticket Confirmation Card */}
        <AnimatedTicket
          orderNumber={orderData.orderNumber}
          amountPaise={orderData.totalPaise}
          date={orderData.date}
          customerName={orderData.customerName}
          paymentMethod={orderData.paymentProvider}
          paymentId={orderData.paymentId}
        />

        {/* Delivery Address & Fulfillment Information Summary */}
        <div className="w-full max-w-sm sm:max-w-md bg-white border border-brand-black/10 rounded-2xl p-6 text-left space-y-5 shadow-xs font-sans">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#7C7A5A] flex items-center gap-1.5">
              <Truck className="w-4 h-4" /> Shipping &amp; Delivery
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {orderData.fulfillmentStatus}
            </span>
          </div>

          {/* Delivery Address Details */}
          {orderData.shippingAddress && (
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#7C7A5A]" />
                <span>{orderData.shippingAddress.fullName}</span>
              </div>
              <p className="pl-5 leading-relaxed">
                {orderData.shippingAddress.street}<br />
                {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.zip}
              </p>
              <div className="pl-5 pt-1 space-y-0.5 text-[11px] text-neutral-500 font-mono">
                {orderData.shippingAddress.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-neutral-400" /> +91 {orderData.shippingAddress.phone}
                  </div>
                )}
                {orderData.shippingAddress.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-neutral-400" /> {orderData.shippingAddress.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expected Shipping Information */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Expected Dispatch
              </p>
              <p className="font-semibold text-neutral-800">
                1–2 Business Days from Lucknow Atelier
              </p>
            </div>

            {/* Track Order Action Button */}
            {orderData.trackingUrl ? (
              <a
                href={orderData.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C7A5A] hover:text-[#5F5D3D] transition-colors py-1.5 px-3 bg-[#7C7A5A]/10 rounded-lg shrink-0"
              >
                Track Live Shipment <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <Link
                href={`/track-order?orderNumber=${encodeURIComponent(orderData.orderNumber)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C7A5A] hover:text-[#5F5D3D] transition-colors py-1.5 px-3 bg-[#7C7A5A]/10 rounded-lg shrink-0"
              >
                Track Order <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Action Button Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm sm:max-w-md pt-2 font-sans">
          <Link href="/account/orders" className="w-full sm:w-1/2">
            <button className="w-full h-12 bg-brand-black text-white hover:bg-brand-sage text-[11px] uppercase tracking-[0.18em] font-semibold transition-all duration-300 rounded-full flex items-center justify-center gap-2 shadow-xs cursor-pointer">
              <History className="w-4 h-4" /> My Orders
            </button>
          </Link>
          <Link href="/shop" className="w-full sm:w-1/2">
            <button className="w-full h-12 bg-white text-[#161616] border border-brand-black/15 hover:border-brand-black text-[11px] uppercase tracking-[0.18em] font-semibold transition-all duration-300 rounded-full flex items-center justify-center gap-2 shadow-xs cursor-pointer">
              <ShoppingBag className="w-4 h-4 text-brand-sage" /> Shop More
            </button>
          </Link>
        </div>

        <p className="text-[11px] text-neutral-400 font-sans max-w-xs leading-relaxed">
          Order updates and tracking information have been dispatched to your email address. You can also view historical orders anytime under My Orders.
        </p>

      </Container>
    </div>
  );
}
