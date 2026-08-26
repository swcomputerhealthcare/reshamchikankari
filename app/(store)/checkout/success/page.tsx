import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import { Check } from "lucide-react";

interface SuccessPageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function CheckoutSuccessPage(props: SuccessPageProps) {
  const searchParams = await props.searchParams;
  const orderNumber = searchParams.orderNumber || "RES-UNKNOWN";

  return (
    <>

      {/* Content Card */}
      <div className="py-20">
        <Container className="max-w-md text-center">
          <div className="bg-white border border-brand-black/5 p-8 sm:p-12 shadow-xs rounded-lg font-sans space-y-6">
            <div className="w-16 h-16 bg-brand-sage/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-brand-sage" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] tracking-widest font-sans uppercase font-bold text-brand-sage block">
                ORDER PLACED SUCCESSFULLY
              </span>
              <h1 className="font-display text-3xl text-brand-black">
                Congratulations!
              </h1>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed uppercase tracking-wider">
              Your handcrafted Lucknowi Chikankari order has been successfully placed. Our local artisans are preparing your package.
            </p>

            <div className="bg-neutral-50 p-4 border border-brand-black/5 rounded-lg space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">
                Order Reference Number
              </span>
              <span className="text-sm font-bold text-brand-black tracking-wider">
                {orderNumber}
              </span>
            </div>

            <div className="pt-4 space-y-3">
              <Link href="/shop" className="block">
                <button className="w-full py-4 bg-brand-black text-brand-offwhite hover:bg-neutral-800 text-xs uppercase tracking-widest font-semibold transition-colors duration-200 cursor-pointer rounded-lg">
                  Continue Shopping
                </button>
              </Link>
              <Link href="/account" className="block text-xs text-neutral-500 hover:text-brand-black transition-colors uppercase tracking-wider font-semibold pt-2">
                Go to Order History
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
