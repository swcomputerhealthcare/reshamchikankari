'use client';

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrderAction, type AddressData } from "@/actions/order";
import { type CartDetails } from "@/lib/cart";
import Button from "@/components/ui/button";

interface CheckoutFormProps {
  cart: CartDetails;
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  wallet: {
    availableBalancePaise: number;
    lockedBalancePaise: number;
    currency: string;
  };
  discountPaise: number;
  appliedCouponCode?: string;
}

export default function CheckoutForm({ cart, user, wallet, discountPaise, appliedCouponCode }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [useWallet, setUseWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: user.name || "",
    email: user.email || "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Math Calculations
  const subtotalPaise = cart.subtotalPaise;
  const shippingPaise = subtotalPaise >= 400000 ? 0 : 15000;
  const codFeePaise = paymentMethod === "COD" ? 5000 : 0;
  const totalPaise = subtotalPaise - discountPaise + shippingPaise + codFeePaise;

  const maxWalletDeductPaise = Math.min(wallet.availableBalancePaise, totalPaise);
  const appliedWalletPaise = useWallet ? maxWalletDeductPaise : 0;
  const finalTotalPaise = totalPaise - appliedWalletPaise;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!form.fullName || !form.email || !form.street || !form.city || !form.state || !form.zip || !form.phone) {
      setError("Please complete all shipping address and contact fields.");
      return;
    }

    startTransition(async () => {
      const address: AddressData = {
        fullName: form.fullName,
        email: form.email,
        street: form.street,
        city: form.city,
        state: form.state,
        zip: form.zip,
        phone: form.phone,
      };

      const result = await createOrderAction(address, paymentMethod, appliedWalletPaise);
      if (result.success && result.orderNumber) {
        router.push(`/checkout/success?orderNumber=${result.orderNumber}`);
      } else {
        setError(result.error || "Something went wrong while placing your order. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">
      {/* Left Column: Form details */}
      <div className="lg:col-span-7 space-y-10">
        {/* Shipping Address Section */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-brand-black border-b border-brand-black/5 pb-3">
            Shipping Information
          </h2>

          {error && (
            <div className="p-4 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-xs font-sans rounded-lg uppercase tracking-wider font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-500">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Satya Dev"
                className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors duration-200 text-base rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-500">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                inputMode="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors duration-200 text-base rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-500">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                inputMode="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors duration-200 text-base rounded-lg"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-500">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                required
                value={form.street}
                onChange={handleChange}
                placeholder="Flat / House no, Building name, Street"
                className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors duration-200 text-base rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-500">
                City
              </label>
              <input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                placeholder="Lucknow"
                className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors duration-200 text-base rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-500">
                State
              </label>
              <input
                type="text"
                name="state"
                required
                value={form.state}
                onChange={handleChange}
                placeholder="Uttar Pradesh"
                className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors duration-200 text-base rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-500">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                name="zip"
                inputMode="numeric"
                required
                value={form.zip}
                onChange={handleChange}
                placeholder="226001"
                className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors duration-200 text-base rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods selector */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-brand-black border-b border-brand-black/5 pb-3">
            Payment Option
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
            {/* Online payment */}
            <div
              onClick={() => setPaymentMethod("ONLINE")}
              className={`p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between h-32 rounded-lg select-none ${
                paymentMethod === "ONLINE"
                  ? "border-brand-black bg-brand-black/5"
                  : "border-brand-black/10 hover:border-brand-black/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-black uppercase tracking-wider text-[10px]">
                  Online Checkout
                </span>
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                  className="accent-brand-black cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-wider">
                UPI / Credit Card / Debit Card / Netbanking. Secure transactions.
              </p>
            </div>

            {/* Cash on delivery */}
            <div
              onClick={() => setPaymentMethod("COD")}
              className={`p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between h-32 rounded-lg select-none ${
                paymentMethod === "COD"
                  ? "border-brand-black bg-brand-black/5"
                  : "border-brand-black/10 hover:border-brand-black/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-black uppercase tracking-wider text-[10px]">
                  Cash On Delivery (COD)
                </span>
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-brand-black cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-wider">
                Pay on delivery. Adds ₹50 handling charge to your final checkout amount.
              </p>
            </div>
          </div>

          {paymentMethod === "COD" && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] uppercase font-bold tracking-wider font-sans rounded-lg">
              ⓘ Cash on Delivery Convenience Fee of ₹50 will be collected at delivery and is added below.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Summary Sheet */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-lg shadow-xs">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6 border-b border-brand-black/5 pb-4">
            Items in Order
          </h2>

          <div className="space-y-4 max-h-72 overflow-y-auto border-b border-brand-black/5 pb-6">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative h-16 w-12 flex-shrink-0 bg-neutral-50 border border-brand-black/5 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain bg-white"
                    sizes="60px"
                  />
                </div>
                <div className="flex-1 min-w-0 font-sans text-xs">
                  <h3 className="font-medium text-brand-black line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Size: {item.sizeName || "Standard"} | Qty: {item.quantity}
                  </p>
                  <p className="text-[10px] font-semibold text-neutral-500 mt-1">
                    ₹{(item.pricePaise / 100).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdowns */}
          <div className="space-y-4 border-b border-brand-black/5 py-6">
            <div className="flex justify-between text-xs sm:text-sm text-neutral-600 font-sans">
              <span>Bag Subtotal</span>
              <span className="font-semibold text-brand-black">
                ₹{(subtotalPaise / 100).toLocaleString("en-IN")}
              </span>
            </div>

            {discountPaise > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-green-700 font-medium font-sans">
                <span>Coupon Discount ({appliedCouponCode})</span>
                <span>&minus; ₹{(discountPaise / 100).toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex justify-between text-xs sm:text-sm text-neutral-600 font-sans">
              <span>Shipping Fee</span>
              <span className="font-semibold text-brand-black uppercase text-xs tracking-wider">
                {shippingPaise === 0 ? "Free" : "₹150.00"}
              </span>
            </div>

            {paymentMethod === "COD" && (
              <div className="flex justify-between text-xs sm:text-sm text-amber-700 font-semibold font-sans">
                <span>Cash on Delivery Handling Charge</span>
                <span>₹50.00</span>
              </div>
            )}

            {appliedWalletPaise > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-neutral-600 font-sans font-medium">
                <span>Paid via RC Wallet</span>
                <span className="text-[#3F5031] font-bold">&minus; ₹{(appliedWalletPaise / 100).toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>

          {/* Wallet Toggle Option */}
          {wallet.availableBalancePaise > 0 && (
            <div className="border-b border-brand-black/5 py-6 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-black uppercase tracking-wider text-[10px]">
                  Use RC Wallet Balance
                </span>
                <span className="font-sans text-[10px] text-neutral-400 font-semibold">
                  Available: ₹{(wallet.availableBalancePaise / 100).toLocaleString("en-IN")}
                </span>
              </div>
              <label className="flex items-center gap-2 p-3.5 border border-brand-black/10 rounded-lg cursor-pointer bg-brand-offwhite/50 hover:bg-brand-black/5 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={useWallet}
                  onChange={(e) => setUseWallet(e.target.checked)}
                  className="accent-brand-black cursor-pointer"
                />
                <span className="text-[11px] font-medium text-neutral-600">
                  Apply ₹{(maxWalletDeductPaise / 100).toLocaleString("en-IN")} from wallet
                </span>
              </label>
            </div>
          )}

          {/* Grand Total */}
          <div className="pt-6 space-y-6">
            <div className="flex justify-between items-baseline font-sans">
              <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Grand Total</span>
              <span className="text-xl sm:text-2xl font-bold text-brand-black">
                ₹{(finalTotalPaise / 100).toLocaleString("en-IN")}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isPending}
              className="w-full py-4 text-xs tracking-widest uppercase font-semibold"
            >
              {finalTotalPaise === 0
                ? "Place Order (Paid via Wallet)"
                : paymentMethod === "COD"
                ? "Place COD Order"
                : "Pay & Place Order"}
            </Button>

            <Link href="/cart" className="block text-center text-xs text-neutral-500 hover:text-brand-black transition-colors uppercase tracking-wider pt-2 font-sans">
              Modify Shopping Bag
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
