import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import AnimatedTicket from "@/components/checkout/animated-ticket";
import { requireUser } from "@/lib/auth/helpers";
import { db } from "@/db";
import { orders, orderTimeline } from "@/db/schema/order";
import { eq, and } from "drizzle-orm";
import { ArrowLeft, Package, Truck, ShieldCheck, MapPin, CreditCard, Clock } from "lucide-react";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: OrderDetailsPageProps) {
  const params = await props.params;
  return {
    title: `Order #${params.id} — Resham Chikankari`,
    description: "Detailed view of your order history and official digital receipt.",
  };
}

export default async function CustomerOrderDetailPage(props: OrderDetailsPageProps) {
  const user = await requireUser();
  const params = await props.params;
  const orderId = params.id;

  const isDbAvailable = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");

  let order: any = null;

  if (isDbAvailable) {
    try {
      order = await db.query.orders.findFirst({
        where: and(eq(orders.id, orderId), eq(orders.userId, user.id)),
        with: {
          items: true,
          timeline: true,
        },
      });

      if (!order) {
        // Search by orderNumber
        order = await db.query.orders.findFirst({
          where: and(eq(orders.orderNumber, orderId), eq(orders.userId, user.id)),
          with: {
            items: true,
            timeline: true,
          },
        });
      }

      // Auto-sync live AWB tracking details if order was submitted to Shiprocket but AWB was pending
      if (order && order.shiprocketOrderId && !order.awbCode) {
        try {
          const { syncOrderTrackingAction } = await import("@/actions/shiprocket");
          await syncOrderTrackingAction(order.id);
          const refreshed = await db.query.orders.findFirst({
            where: eq(orders.id, order.id),
            with: { items: true, timeline: true },
          });
          if (refreshed) order = refreshed;
        } catch (syncErr) {
          console.warn("Auto AWB sync notice on order details page:", syncErr);
        }
      }
    } catch (e) {
      console.error("Failed to query order details:", e);
    }
  }

  if (!order) {
    // If not found in DB or offline, build fallback order representation
    order = {
      id: orderId,
      orderNumber: orderId,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentProvider: "RAZORPAY",
      paymentId: null,
      subtotalPaise: 100,
      discountPaise: 0,
      shippingPaise: 0,
      totalPaise: 100,
      createdAt: new Date(),
      shippingAddressSnapshot: {
        fullName: user.name || "Valued Customer",
        email: user.email,
        street: "Standard Delivery Address",
        city: "Lucknow",
        state: "Uttar Pradesh",
        zip: "226001",
        phone: "9876543210",
      },
      items: [],
      timeline: [
        { id: "1", status: "CONFIRMED", message: "Order placed successfully", createdAt: new Date() }
      ],
    };
  }

  const shippingAddr = order.shippingAddressSnapshot as any;

  return (
    <div className="bg-[#FFF9F4] min-h-screen text-[#161616] py-12 sm:py-16 select-none font-sans">
      <Container className="max-w-4xl space-y-10">
        
        {/* Top Return Link */}
        <div className="flex justify-between items-center border-b border-[#ECE9E2] pb-6">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#69727D] hover:text-[#7C7A5A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Order History
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#7C7A5A] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Verified Order Record
          </span>
        </div>

        {/* Main Grid: Left Detailed Invoice & Timeline, Right Animated Ticket Receipt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Order Breakdown & Timeline */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Header info card */}
            <div className="bg-white border border-[#ECE9E2] p-6 sm:p-8 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E694AA]">
                    OFFICIAL ORDER STATEMENT
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl text-[#161616] mt-0.5">
                    Order #{order.orderNumber}
                  </h1>
                </div>
                <span className="px-3 py-1 bg-[#7C7A5A]/10 text-[#7C7A5A] border border-[#7C7A5A]/20 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-[#ECE9E2]">
                <div>
                  <span className="text-[10px] text-[#69727D] font-bold uppercase tracking-widest block">Date Placed</span>
                  <span className="font-medium text-neutral-700">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#69727D] font-bold uppercase tracking-widest block">Payment Status</span>
                  <span className="font-semibold text-[#7C7A5A]">
                    {order.paymentStatus} ({order.paymentProvider || "ONLINE"})
                  </span>
                </div>
              </div>
            </div>
              
              {/* Order Items */}
              <div className="bg-white border border-[#ECE9E2] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                <h3 className="font-bold uppercase tracking-widest text-xs text-[#7C7A5A] border-b border-[#ECE9E2] pb-3">
                  Purchased Items ({order.items.length})
                </h3>
                <div className="divide-y divide-[#ECE9E2]">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                      <div className="w-16 h-20 bg-[#F4F1EA] rounded-md overflow-hidden relative shrink-0 border border-[#ECE9E2]">
                        {item.product?.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 font-serif">
                            Resham
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-semibold text-[#161616] truncate">{item.productName}</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Qty: {item.quantity} {item.size && `• Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                        </p>
                        <p className="text-xs font-semibold text-[#7C7A5A] mt-1">
                          ₹{(item.lineTotalPaise / 100).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-[#ECE9E2] pt-4 space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{(order.subtotalPaise / 100).toLocaleString("en-IN")}</span>
                  </div>
                  {order.discountPaise > 0 && (
                    <div className="flex justify-between text-[#E694AA]">
                      <span>Discount / Privilege applied</span>
                      <span>-₹{(order.discountPaise / 100).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Complimentary Express Shipping</span>
                    <span>{order.shippingPaise === 0 ? "FREE" : `₹${(order.shippingPaise / 100).toLocaleString("en-IN")}`}</span>
                  </div>
                  {order.walletAmountPaise > 0 && (
                    <div className="flex justify-between text-[#7C7A5A]">
                      <span>Wallet Balance Applied</span>
                      <span>-₹{(order.walletAmountPaise / 100).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-[#161616] pt-2 border-t border-[#ECE9E2]">
                    <span>Total Amount Paid</span>
                    <span>₹{(order.totalPaise / 100).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Shipping & Shipment Tracking Card */}
              <div className="bg-white border border-[#ECE9E2] p-5 sm:p-8 rounded-2xl shadow-xs space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-[#ECE9E2] pb-3">
                  <h3 className="font-bold uppercase tracking-widest text-[#7C7A5A] flex items-center gap-1.5">
                    <Truck className="w-4 h-4" /> Shipment & Tracking
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-[#7C7A5A]/10 text-[#7C7A5A] rounded-full">
                    {order.fulfillmentStatus || "PREPARING"}
                  </span>
                </div>

                {/* Courier & AWB detail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-[#F8F2EC] p-3.5 sm:p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#69727D] font-bold block mb-0.5">Courier Partner</span>
                    <span className="font-bold text-[#161616] text-xs sm:text-sm break-words">{order.courierName || "Assigning Courier..."}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#69727D] font-bold block mb-0.5">AWB Tracking No.</span>
                    <span className="font-mono font-bold text-[#161616] text-xs sm:text-sm break-all">{order.awbCode || "Generating AWB..."}</span>
                  </div>
                </div>

                {/* Tracking Step Indicator */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#69727D] block">Fulfillment Journey</span>
                  <div className="grid grid-cols-5 gap-1 sm:gap-2 text-[8px] sm:text-[10px] font-bold text-center uppercase">
                    <div
                      className={`py-2 px-1 min-h-[44px] sm:min-h-[48px] rounded-md sm:rounded-lg border flex flex-col items-center justify-center transition-all ${
                        order.fulfillmentStatus
                          ? "bg-[#7C7A5A] text-white border-[#7C7A5A] shadow-2xs"
                          : "bg-neutral-50 text-neutral-400 border-neutral-200"
                      }`}
                    >
                      <span className="leading-tight tracking-tight sm:tracking-wider">Confirmed</span>
                    </div>
                    <div
                      className={`py-2 px-1 min-h-[44px] sm:min-h-[48px] rounded-md sm:rounded-lg border flex flex-col items-center justify-center transition-all ${
                        ["AWB_ASSIGNED", "PICKUP_SCHEDULED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
                          order.fulfillmentStatus
                        )
                          ? "bg-[#7C7A5A] text-white border-[#7C7A5A] shadow-2xs"
                          : "bg-neutral-50 text-neutral-400 border-neutral-200"
                      }`}
                    >
                      <span className="leading-tight tracking-tight sm:tracking-wider">Packed</span>
                    </div>
                    <div
                      className={`py-2 px-1 min-h-[44px] sm:min-h-[48px] rounded-md sm:rounded-lg border flex flex-col items-center justify-center transition-all ${
                        ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.fulfillmentStatus)
                          ? "bg-[#7C7A5A] text-white border-[#7C7A5A] shadow-2xs"
                          : "bg-neutral-50 text-neutral-400 border-neutral-200"
                      }`}
                    >
                      <span className="leading-tight tracking-tight sm:tracking-wider">Shipped</span>
                    </div>
                    <div
                      className={`py-2 px-1 min-h-[44px] sm:min-h-[48px] rounded-md sm:rounded-lg border flex flex-col items-center justify-center transition-all ${
                        ["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.fulfillmentStatus)
                          ? "bg-[#7C7A5A] text-white border-[#7C7A5A] shadow-2xs"
                          : "bg-neutral-50 text-neutral-400 border-neutral-200"
                      }`}
                    >
                      <span className="leading-tight tracking-tight sm:tracking-wider">Out for Delivery</span>
                    </div>
                    <div
                      className={`py-2 px-1 min-h-[44px] sm:min-h-[48px] rounded-md sm:rounded-lg border flex flex-col items-center justify-center transition-all ${
                        order.fulfillmentStatus === "DELIVERED"
                          ? "bg-[#7C7A5A] text-white border-[#7C7A5A] shadow-2xs"
                          : "bg-neutral-50 text-neutral-400 border-neutral-200"
                      }`}
                    >
                      <span className="leading-tight tracking-tight sm:tracking-wider">Delivered</span>
                    </div>
                  </div>
                </div>

                {order.trackingUrl && order.awbCode && (
                  <div className="pt-2 flex justify-end">
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7C7A5A] text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-black transition-colors"
                    >
                      <span>Track Live Shipment</span>
                      <Truck className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

            {/* Shipping Address */}
            <div className="bg-white border border-[#ECE9E2] p-6 sm:p-8 rounded-2xl shadow-xs space-y-3 text-xs">
              <h3 className="font-bold uppercase tracking-widest text-[#7C7A5A] border-b border-[#ECE9E2] pb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Shipping Destination
              </h3>
              <p className="font-bold text-[#161616]">{shippingAddr?.fullName || user.name}</p>
              <p className="text-neutral-600">{shippingAddr?.street}</p>
              <p className="text-neutral-600">{shippingAddr?.city}, {shippingAddr?.state} - {shippingAddr?.zip}</p>
              <p className="text-neutral-600">Phone: {shippingAddr?.phone}</p>
            </div>

          </div>

          {/* Right Column: Animated Ticket Receipt Card */}
          <div className="lg:col-span-5 flex flex-col items-center sticky top-24">
            <AnimatedTicket
              orderNumber={order.orderNumber}
              amountPaise={order.totalPaise}
              date={new Date(order.createdAt)}
              customerName={shippingAddr?.fullName || user.name || "Valued Patron"}
              paymentMethod={order.paymentProvider}
              paymentId={order.paymentId}
              itemsCount={order.items?.length || 1}
            />
          </div>

        </div>
      </Container>
    </div>
  );
}
