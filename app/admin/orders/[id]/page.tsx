import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import { db } from "@/db";
import { orders, orderTimeline } from "@/db/schema/order";
import { eq, desc } from "drizzle-orm";
import OrderFulfillmentCard from "@/components/admin/order-fulfillment-card";
import OrderRefundModal from "@/components/admin/order-refund-modal";
import { ArrowLeft, Clock, MapPin, User, Receipt } from "lucide-react";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: "Admin Order Details — Resham",
};

export default async function AdminOrderDetailPage(props: AdminOrderDetailPageProps) {
  // Enforce ADMIN authorization check
  await requireAdmin();

  const params = await props.params;
  const id = params.id;

  let order = null;
  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  let existingRefunds: any[] = [];

  if (isDbAvailable) {
    try {
      order = await db.query.orders.findFirst({
        where: eq(orders.id, id),
        with: {
          user: true,
          items: true,
          timeline: {
            orderBy: desc(orderTimeline.createdAt),
          },
        },
      });

      const { refunds } = await import("@/db/schema/refund");
      existingRefunds = await db.select().from(refunds).where(eq(refunds.orderId, id));
    } catch (e) {
      console.error("Failed to query order details:", e);
    }
  }

  if (!order) {
    notFound();
  }

  const customerName = order.user?.fullName || (order.shippingAddressSnapshot as any)?.fullName || "Guest Customer";
  const customerEmail = order.user?.email || (order.shippingAddressSnapshot as any)?.email || "-";
  const customerPhone = order.user?.phone || (order.shippingAddressSnapshot as any)?.phone || "-";

  const shipping = order.shippingAddressSnapshot as any;
  const billing = (order.billingAddressSnapshot as any) || shipping;

  return (
    <div className="pb-24 selection:bg-brand-pink/20 font-sans">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <Link
            href="/admin/orders"
            className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold hover:text-white transition-colors flex items-center gap-1.5 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
                Order details
              </span>
              <h1 className="font-display text-3xl tracking-wide">
                #{order.orderNumber}
              </h1>
            </div>
            <div className="flex gap-2 text-[9px] font-bold uppercase tracking-widest">
              <span
                className={`px-3 py-1 rounded-xs ${
                  order.paymentStatus === "PAID"
                    ? "bg-brand-sage text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                Payment: {order.paymentStatus}
              </span>
              <span className="px-3 py-1 bg-white/10 text-white rounded-xs">
                Status: {order.status}
              </span>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Items and Timeline logs */}
          <div className="lg:col-span-8 space-y-8">
            {/* Order Items Snapshot Card */}
            <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">
                Ordered Items ({order.items.length})
              </h3>
              <div className="divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-semibold text-brand-black">
                        {item.productNameSnapshot || item.productName}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-sans mt-0.5">
                        SKU: {item.skuSnapshot || item.sku}
                        {item.variantSnapshot && (
                          <span className="ml-3">Size: {item.variantSnapshot}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-brand-black">
                        ₹{((item.unitPricePaise * item.quantity) / 100).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-sans">
                        ₹{(item.unitPricePaise / 100).toLocaleString("en-IN")} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Logs Card */}
            <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6 flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-pink" />
                <span>Status History</span>
              </h3>

              {order.timeline.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  No timeline updates logged yet.
                </div>
              ) : (
                <div className="relative border-l border-neutral-100 pl-6 ml-2 space-y-6">
                  {order.timeline.map((log) => (
                    <div key={log.id} className="relative text-xs">
                      {/* Bullet point indicator */}
                      <span className="absolute -left-[30px] top-0.5 h-3 w-3 rounded-full bg-brand-sage border-2 border-white ring-2 ring-brand-sage/20" />
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold text-neutral-400 mb-1">
                        <span>{log.status}</span>
                        <span>
                          {log.createdAt.toDateString()} at {log.createdAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-neutral-600 leading-relaxed font-sans">{log.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Refund Modal, Fulfillment, Customer, Shipping, Pricing */}
          <div className="lg:col-span-4 space-y-8">
            {/* Real Refund Modal */}
            <OrderRefundModal
              orderId={order.id}
              orderNumber={order.orderNumber}
              totalPaise={order.totalPaise}
              paymentStatus={order.paymentStatus}
              existingRefunds={existingRefunds}
            />

            {/* Fulfillment controls */}
            <OrderFulfillmentCard
              orderId={order.id}
              currentStatus={order.status}
              fulfillmentStatus={order.fulfillmentStatus}
              shiprocketOrderId={order.shiprocketOrderId}
              shiprocketShipmentId={order.shiprocketShipmentId}
              awbCode={order.awbCode}
              courierName={order.courierName}
              trackingUrl={order.trackingUrl}
              shippingError={order.shippingError}
            />

            {/* Customer info card */}
            <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs text-xs space-y-4">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Customer Profile</span>
              </h4>
              <div>
                <div className="font-semibold text-brand-black text-sm">{customerName}</div>
                <div className="text-neutral-400 font-sans mt-0.5">{customerEmail}</div>
                <div className="text-neutral-400 font-sans mt-0.5">{customerPhone}</div>
              </div>
            </div>

            {/* Shipping details snapshot */}
            <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs text-xs space-y-4">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Delivery Address</span>
              </h4>
              <div className="leading-relaxed text-neutral-600 font-sans">
                <div className="font-semibold text-brand-black font-sans uppercase text-[10px] tracking-wide mb-1">
                  Shipping:
                </div>
                {shipping.street},<br />
                {shipping.landmark && `${shipping.landmark}, `}
                {shipping.city}, {shipping.state} - {shipping.pincode}<br />
                {shipping.country}
              </div>

              {!!order.billingAddressSnapshot && (
                <div className="leading-relaxed text-neutral-600 font-sans border-t border-neutral-100 pt-3 mt-3">
                  <div className="font-semibold text-brand-black font-sans uppercase text-[10px] tracking-wide mb-1">
                    Billing:
                  </div>
                  {billing.street},<br />
                  {billing.landmark && `${billing.landmark}, `}
                  {billing.city}, {billing.state} - {billing.pincode}<br />
                  {billing.country}
                </div>
              )}
            </div>

            {/* Order Pricing Breakdown summary */}
            <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs text-xs space-y-4">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span>Pricing Summary</span>
              </h4>

              <div className="space-y-2 border-b border-neutral-100 pb-3 text-neutral-500 font-sans">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(order.subtotalPaise / 100).toLocaleString("en-IN")}</span>
                </div>
                {order.discountPaise > 0 && (
                  <div className="flex justify-between text-brand-pink font-semibold">
                    <span>Discount ({order.couponCodeSnapshot || "Coupon"})</span>
                    <span>-₹{(order.discountPaise / 100).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>₹{(order.shippingPaise / 100).toLocaleString("en-IN")}</span>
                </div>
                {order.walletAmountPaise > 0 && (
                  <div className="flex justify-between text-brand-sage font-semibold">
                    <span>Paid via Wallet</span>
                    <span>-₹{(order.walletAmountPaise / 100).toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-brand-black text-sm">
                <span>Final Cash Due</span>
                <span>₹{((order.totalPaise - order.walletAmountPaise) / 100).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
