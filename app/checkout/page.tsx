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

export const metadata = {
  title: "Secure Checkout — Resham Chikankari",
  description: "Complete your address information and checkout securely with cod or online payment.",
};

export default async function CheckoutPage() {
  const user = await requireUser();
  const cart = await getCartDetails();

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  // Fetch Wallet details
  const wallet = await getOrCreateWallet(user.id);

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
    <div className="bg-brand-offwhite min-h-screen text-brand-black selection:bg-brand-pink/20 pb-24">
      {/* Announcement Bar */}
      <div className="w-full bg-brand-black text-brand-offwhite text-[10px] sm:text-xs tracking-widest text-center py-2.5 uppercase font-sans font-medium px-4">
        100% Secure Checkout | Premium Handcrafted Indian Heritage
      </div>

      {/* Navigation Header */}
      <header className="bg-brand-offwhite border-b border-brand-black/5 h-20 flex items-center">
        <Container className="w-full">
          <div className="grid grid-cols-12 items-center w-full">
            {/* Left */}
            <div className="col-span-5 text-left text-[11px] uppercase tracking-widest font-semibold font-sans text-brand-sage flex items-center gap-1.5 select-none">
              <span className="text-xs">🔒</span> Secure Checkout
            </div>
            
            {/* Center */}
            <div className="col-span-2 text-center">
              <Link href="/" className="font-display text-2xl tracking-wider select-none hover:opacity-90 transition-opacity">
                Resham
              </Link>
            </div>
            
            {/* Right */}
            <div className="col-span-5 flex items-center justify-end gap-6 text-[11px] uppercase tracking-widest font-semibold font-sans">
              <Link href="/cart" className="hover:text-brand-pink transition-colors">Return to Bag</Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Checkout Form Container */}
      <div className="py-12 sm:py-16">
        <Container>
          <div className="mb-12 text-center sm:text-left">
            <span className="text-[10px] tracking-widest font-sans uppercase font-bold text-brand-sage mb-2 block">
              SECURE TRANSACTION
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-brand-black mb-2">
              Order Checkout
            </h1>
            <div className="w-12 h-[1px] bg-brand-sage mt-4 sm:mx-0 mx-auto"></div>
          </div>

          <CheckoutForm
            cart={cart}
            user={{ id: user.id, email: user.email, name: user.name }}
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

      <footer className="bg-brand-black text-brand-offwhite/80 py-12 mt-20 border-t border-brand-offwhite/10 text-xs text-center font-sans">
        &copy; {new Date().getFullYear()} Resham Chikankari. All Rights Reserved. Lucknow, India.
      </footer>
    </div>
  );
}
