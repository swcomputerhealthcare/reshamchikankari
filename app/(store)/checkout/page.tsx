import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/ui/container";
import { getCartDetails } from "@/lib/cart";
import { validateCouponCode } from "@/lib/coupon";
import { requireUser } from "@/lib/auth/helpers";
import CheckoutForm from "@/components/checkout/checkout-form";
import { getOrCreateWallet } from "@/lib/wallet";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Checkout — Resham Chikankari",
  description: "Complete your address information and checkout securely for handcrafted Lucknowi garments.",
};

export default async function CheckoutPage() {
  const { getCurrentUser } = await import("@/lib/auth/helpers");
  const user = await getCurrentUser();
  const cart = await getCartDetails();

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const effectiveUser = user || {
    id: "00000000-0000-4000-a000-000000000000",
    name: "",
    email: "",
    role: "CUSTOMER",
  };

  // Fetch Wallet details safely
  let wallet = { availableBalancePaise: 0, lockedBalancePaise: 0, currency: "INR" };
  if (user?.id) {
    try {
      wallet = await getOrCreateWallet(user.id);
    } catch (wErr) {
      console.warn("Checkout wallet lookup warning:", wErr);
    }
  }

  // Validate coupon
  const cookieStore = await cookies();
  const couponCode = cookieStore.get("applied_coupon")?.value;
  let discountPaise = 0;
  let validatedCode = "";

  if (couponCode) {
    const decodedCode = decodeURIComponent(couponCode);
    const validation = await validateCouponCode(decodedCode, cart.subtotalPaise);
    if (validation.success) {
      discountPaise = validation.discountPaise || 0;
      validatedCode = validation.coupon?.code || decodedCode;
    }
  }

  return (
    <div className="bg-[#FFF9F4] min-h-screen text-[#161616] selection:bg-[#E694AA]/20 pb-24 font-sans text-left">
      {/* Top Hairline Header */}
      <header className="bg-[#FFF9F4] border-b border-[#ECE9E2] h-20 flex items-center">
        <Container className="w-full">
          <div className="grid grid-cols-12 items-center w-full">
            {/* Left Return Link */}
            <div className="col-span-4 text-left">
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-neutral-600 hover:text-[#7C7A5A] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Bag
              </Link>
            </div>
            
            {/* Center Brand Wordmark */}
            <div className="col-span-4 text-center">
              <Link href="/" className="font-display text-2xl sm:text-3xl tracking-wide hover:opacity-90 transition-opacity">
                Resham Chikankari
              </Link>
            </div>
            
            {/* Right Security Indicator */}
            <div className="col-span-4 flex items-center justify-end text-[10px] uppercase tracking-[0.2em] font-bold text-[#7C7A5A] gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#7C7A5A]" />
              <span className="hidden sm:inline">256-Bit Encrypted</span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Checkout Section */}
      <div className="py-10 sm:py-14">
        <Container>
          {/* Header Title & Step Indicator */}
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#ECE9E2] pb-6">
            <div>
              <span className="text-[10px] sm:text-xs tracking-[0.3em] font-sans uppercase font-bold text-[#E694AA] mb-1 block">
                SECURE CHECKOUT
              </span>
              <h1 className="font-display text-3xl sm:text-5xl text-[#161616]">
                Order Checkout
              </h1>
            </div>

            {/* Step Rhythm Indicator */}
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-mono tracking-widest uppercase text-neutral-500">
              <span className="text-[#7C7A5A] font-bold">01 ADDRESS</span>
              <span>──</span>
              <span className="text-[#7C7A5A] font-bold">02 PAYMENT</span>
              <span>──</span>
              <span className="text-neutral-400">03 CONFIRMATION</span>
            </div>
          </div>

          <CheckoutForm
            cart={cart}
            user={{ id: effectiveUser.id, email: effectiveUser.email, name: effectiveUser.name }}
            wallet={{
              availableBalancePaise: wallet.availableBalancePaise,
              lockedBalancePaise: wallet.lockedBalancePaise,
              currency: wallet.currency
            }}
            discountPaise={discountPaise}
            appliedCouponCode={validatedCode || undefined}
          />
        </Container>
      </div>

      <footer className="bg-[#161616] text-[#FFF9F4]/80 py-12 mt-20 border-t border-[#FFF9F4]/10 text-xs text-center font-sans">
        &copy; {new Date().getFullYear()} Resham Chikankari. All Rights Reserved. Lucknow, India.
      </footer>
    </div>
  );
}
