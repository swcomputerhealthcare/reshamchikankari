import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import AnimatedTicket from "@/components/checkout/animated-ticket";
import OrderSuccessTracker from "@/components/analytics/OrderSuccessTracker";
import { db } from "@/db";
import { orders } from "@/db/schema/order";
import { eq } from "drizzle-orm";
import { ShoppingBag, History } from "lucide-react";

interface SuccessPageProps {
  searchParams: Promise<{ orderNumber?: string; pm?: string; total?: string; name?: string }>;
}

export const metadata = {
  title: "Order Confirmation — Resham Chikankari",
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
    totalPaise: totalQuery || 100,
    customerName: nameQuery,
    paymentProvider: pmQuery,
    paymentId: null as string | null,
    date: new Date(),
    orderId: orderRef,
  };

  if (isDbAvailable) {
    try {
      const [dbOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderRef))
        .limit(1);

      if (dbOrder) {
        const address = (dbOrder.shippingAddressSnapshot as any) || {};
        orderData = {
          orderNumber: dbOrder.orderNumber,
          totalPaise: dbOrder.totalPaise,
          customerName: address?.fullName || address?.name || nameQuery,
          paymentProvider: dbOrder.paymentProvider || address?.paymentMethod || pmQuery,
          paymentId: dbOrder.paymentId,
          date: dbOrder.createdAt ? new Date(dbOrder.createdAt) : new Date(),
          orderId: dbOrder.id,
        };
      } else {
        // Try searching by order ID
        const [dbOrderById] = await db
          .select()
          .from(orders)
          .where(eq(orders.id, orderRef))
          .limit(1);

        if (dbOrderById) {
          const address = (dbOrderById.shippingAddressSnapshot as any) || {};
          orderData = {
            orderNumber: dbOrderById.orderNumber,
            totalPaise: dbOrderById.totalPaise,
            customerName: address?.fullName || address?.name || nameQuery,
            paymentProvider: dbOrderById.paymentProvider || address?.paymentMethod || pmQuery,
            paymentId: dbOrderById.paymentId,
            date: dbOrderById.createdAt ? new Date(dbOrderById.createdAt) : new Date(),
            orderId: dbOrderById.id,
          };
        }
      }
    } catch (err) {
      console.error("Failed to query order details for success receipt page:", err);
    }
  }

  return (
    <div className="bg-[#FFF9F4] min-h-screen text-[#161616] py-12 sm:py-20 select-none">
      <OrderSuccessTracker
        orderNumber={orderData.orderNumber}
        totalPaise={orderData.totalPaise}
      />
      <Container className="max-w-xl flex flex-col items-center justify-center text-center space-y-8">
        
        {/* Animated Ticket Confirmation Card */}
        <AnimatedTicket
          orderNumber={orderData.orderNumber}
          amountPaise={orderData.totalPaise}
          date={orderData.date}
          customerName={orderData.customerName}
          paymentMethod={orderData.paymentProvider}
          paymentId={orderData.paymentId}
        />

        {/* Action Button Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm pt-4 font-sans">
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

      </Container>
    </div>
  );
}
