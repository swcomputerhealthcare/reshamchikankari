import React from "react";
import Container from "@/components/ui/container";
import { getCartDetails } from "@/lib/cart";
import CartItemsTable from "@/components/cart/cart-items-table";

export const metadata = {
  title: "Shopping Bag — Resham Chikankari",
  description: "Review and edit items in your Lucknowi Chikankari shopping bag.",
};

export default async function CartPage() {
  const cart = await getCartDetails();

  return (
    <>

      {/* Main Cart Section */}
      <div className="py-16 sm:py-24">
        <Container className="max-w-6xl">
          <div className="mb-12 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs tracking-[0.2em] font-sans uppercase font-bold text-neutral-400 mb-3 block">
              YOUR SELECTION
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-brand-black mb-3">
              Your Cart
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500">
              Pieces chosen for your wardrobe, crafted with care.
            </p>
          </div>

          <CartItemsTable
            items={cart.items}
            subtotalPaise={cart.subtotalPaise}
            appliedCouponCode={cart.appliedCouponCode}
            discountPaise={cart.discountPaise}
          />
        </Container>
      </div>
    </>
  );
}
