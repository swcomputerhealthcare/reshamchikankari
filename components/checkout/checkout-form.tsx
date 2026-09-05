'use client';

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createOrderAction, verifyRazorpayPaymentAction, type AddressData } from "@/actions/order";
import { type CartDetails } from "@/lib/cart";
import Button from "@/components/ui/button";
import { ShieldCheck, Lock, AlertCircle, Check, CreditCard, Truck, Wallet } from "lucide-react";

import EditorialOrderSummary from "@/components/checkout/editorial-order-summary";

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, zip: rawVal }));
    if (errors.zip) {
      setErrors((prev) => ({ ...prev, zip: "" }));
    }

    if (rawVal.length === 6) {
      setIsPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${rawVal}`);
        const data = await res.json();
        if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setForm((prev) => ({
            ...prev,
            city: po.District || po.Block || prev.city,
            state: po.State || prev.state,
          }));
        }
      } catch {
        // Ignore PIN API failure
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  // Price Calculations
  const subtotalPaise = cart.subtotalPaise;
  const isTestCart = cart.items.some((item) => item.sku?.includes("TEST") || item.slug?.includes("test") || item.pricePaise <= 500);
  const shippingPaise = (subtotalPaise >= 400000 || isTestCart) ? 0 : 15000;
  const codFeePaise = paymentMethod === "COD" ? 5000 : 0;
  const totalPaise = subtotalPaise - discountPaise + shippingPaise + codFeePaise;

  const maxWalletDeductPaise = Math.min(wallet.availableBalancePaise, totalPaise);
  const appliedWalletPaise = useWallet ? maxWalletDeductPaise : 0;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone Validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = form.phone.replace(/[\s\-\+]/g, "");
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number";
    }

    if (!form.street.trim() || form.street.trim().length < 5) {
      newErrors.street = "Please enter a complete street address (min 5 characters)";
    }
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";

    // Pincode Validation (6 digits for India)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!form.zip.trim() || !pincodeRegex.test(form.zip.trim())) {
      newErrors.zip = "Please enter a valid 6-digit Indian postal code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError("Please correct the highlighted fields before placing your order.");
      return;
    }

    startTransition(async () => {
      const address: AddressData = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        phone: form.phone.trim(),
      };

      const result = await createOrderAction(address, paymentMethod, appliedWalletPaise);
      if (!result.success) {
        setError(result.error || "Something went wrong while placing your order. Please try again.");
        return;
      }

      if (result.requiresPayment && result.razorpayOrderId) {
        if (typeof window === "undefined" || !(window as any).Razorpay) {
          setError("Razorpay SDK failed to load. Please refresh the page and try again.");
          return;
        }

        const options = {
          key: result.razorpayKeyId,
          amount: result.amountPaise,
          currency: "INR",
          name: "Resham Chikankari",
          description: `Order #${result.orderNumber}`,
          order_id: result.razorpayOrderId,
          handler: async function (response: any) {
            startTransition(async () => {
              try {
                const verifyRes = await verifyRazorpayPaymentAction(
                  result.orderId!,
                  response.razorpay_payment_id,
                  response.razorpay_order_id,
                  response.razorpay_signature
                );
                if (verifyRes.success && verifyRes.orderNumber) {
                  router.push(`/checkout/success?orderNumber=${verifyRes.orderNumber}`);
                } else {
                  setError(verifyRes.error || "Payment verification failed. Please contact support.");
                }
              } catch (verifyErr: any) {
                setError(verifyErr.message || "An error occurred during payment verification.");
              }
            });
          },
          prefill: {
            name: form.fullName.trim(),
            email: form.email.trim(),
            contact: form.phone.trim(),
          },
          theme: {
            color: "#7C7A5A",
          },
          modal: {
            ondismiss: function () {
              setError("Payment cancelled. You can retry paying whenever you are ready.");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setError(response.error?.description || "Payment process failed. Please try again.");
        });
        rzp.open();
      } else if (result.orderNumber) {
        router.push(`/checkout/success?orderNumber=${result.orderNumber}`);
      }
    });
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 text-left">
      {/* Left Column: Delivery & Payment Details */}
      <div className="lg:col-span-7 space-y-10">
        
        {/* Shipping Address Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-baseline border-b border-brand-black/10 pb-3">
            <h2 className="font-display text-2xl text-brand-black">
              Shipping Information
            </h2>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#7C7A5A] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Delivery
            </span>
          </div>

          {error && (
            <div className="p-4 bg-[#E694AA]/10 border border-[#E694AA]/30 text-[#161616] text-xs font-sans rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#E694AA] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
            {/* Full Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="fullName" className="uppercase tracking-widest text-[10px] font-extrabold text-neutral-800 block">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C7A5A]/20 focus:border-[#7C7A5A] text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal transition-all shadow-xs ${
                  errors.fullName ? "border-red-500 bg-red-50/20" : "border-neutral-300"
                }`}
              />
              {errors.fullName && <p className="text-[10px] text-red-600 font-semibold">{errors.fullName}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="uppercase tracking-widest text-[10px] font-extrabold text-neutral-800 block">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                inputMode="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C7A5A]/20 focus:border-[#7C7A5A] text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal transition-all shadow-xs ${
                  errors.email ? "border-red-500 bg-red-50/20" : "border-neutral-300"
                }`}
              />
              {errors.email && <p className="text-[10px] text-red-600 font-semibold">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="uppercase tracking-widest text-[10px] font-extrabold text-neutral-800 block">
                Phone Number (10 digits) *
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                inputMode="tel"
                maxLength={10}
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C7A5A]/20 focus:border-[#7C7A5A] text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal transition-all shadow-xs ${
                  errors.phone ? "border-red-500 bg-red-50/20" : "border-neutral-300"
                }`}
              />
              {errors.phone && <p className="text-[10px] text-red-600 font-semibold">{errors.phone}</p>}
            </div>

            {/* PIN Code with Auto-Lookup */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex justify-between items-center">
                <label htmlFor="zip" className="uppercase tracking-widest text-[10px] font-extrabold text-neutral-800 block">
                  6-Digit PIN Code *
                </label>
                {isPincodeLoading && (
                  <span className="text-[10px] text-[#7C7A5A] font-semibold animate-pulse">
                    Auto-detecting City &amp; State...
                  </span>
                )}
              </div>
              <input
                id="zip"
                type="text"
                name="zip"
                inputMode="numeric"
                maxLength={6}
                required
                value={form.zip}
                onChange={handleZipChange}
                placeholder="e.g. 226001 (Auto-fills City &amp; State)"
                className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C7A5A]/20 focus:border-[#7C7A5A] text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal transition-all shadow-xs ${
                  errors.zip ? "border-red-500 bg-red-50/20" : "border-neutral-300"
                }`}
              />
              {errors.zip && <p className="text-[10px] text-red-600 font-semibold">{errors.zip}</p>}
            </div>

            {/* Street Address */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="street" className="uppercase tracking-widest text-[10px] font-extrabold text-neutral-800 block">
                Street Address *
              </label>
              <input
                id="street"
                type="text"
                name="street"
                required
                value={form.street}
                onChange={handleChange}
                placeholder="Flat / House No., Building Name, Street / Locality"
                className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C7A5A]/20 focus:border-[#7C7A5A] text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal transition-all shadow-xs ${
                  errors.street ? "border-red-500 bg-red-50/20" : "border-neutral-300"
                }`}
              />
              {errors.street && <p className="text-[10px] text-red-600 font-semibold">{errors.street}</p>}
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label htmlFor="city" className="uppercase tracking-widest text-[10px] font-extrabold text-neutral-800 block">
                City *
              </label>
              <input
                id="city"
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                placeholder="City (e.g. Lucknow)"
                className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C7A5A]/20 focus:border-[#7C7A5A] text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal transition-all shadow-xs ${
                  errors.city ? "border-red-500 bg-red-50/20" : "border-neutral-300"
                }`}
              />
              {errors.city && <p className="text-[10px] text-red-600 font-semibold">{errors.city}</p>}
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label htmlFor="state" className="uppercase tracking-widest text-[10px] font-extrabold text-neutral-800 block">
                State *
              </label>
              <input
                id="state"
                type="text"
                name="state"
                required
                value={form.state}
                onChange={handleChange}
                placeholder="State (e.g. Uttar Pradesh)"
                className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C7A5A]/20 focus:border-[#7C7A5A] text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal transition-all shadow-xs ${
                  errors.state ? "border-red-500 bg-red-50/20" : "border-neutral-300"
                }`}
              />
              {errors.state && <p className="text-[10px] text-red-600 font-semibold">{errors.state}</p>}
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-brand-black border-b border-brand-black/10 pb-3">
            Payment Option
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
            {/* Online Payment */}
            <div
              onClick={() => setPaymentMethod("ONLINE")}
              className={`p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between h-36 rounded-xl select-none ${
                paymentMethod === "ONLINE"
                  ? "border-[#7C7A5A] bg-[#7C7A5A]/5 shadow-xs"
                  : "border-brand-black/10 hover:border-brand-black/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-black uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#7C7A5A]" /> Online Checkout
                </span>
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                  className="accent-[#7C7A5A] cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-neutral-500 leading-relaxed uppercase tracking-wider">
                UPI / Credit Card / Debit Card / Netbanking. Instant order confirmation.
              </p>
            </div>

            {/* Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod("COD")}
              className={`p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between h-36 rounded-xl select-none ${
                paymentMethod === "COD"
                  ? "border-[#7C7A5A] bg-[#7C7A5A]/5 shadow-xs"
                  : "border-brand-black/10 hover:border-brand-black/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-black uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#7C7A5A]" /> Cash On Delivery (COD)
                </span>
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-[#7C7A5A] cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-neutral-500 leading-relaxed uppercase tracking-wider">
                Pay on delivery. Adds ₹50 handling fee to final total.
              </p>
            </div>
          </div>

          {paymentMethod === "COD" && (
            <div className="p-4 bg-[#F8F2EC] border border-[#ECE9E2] text-neutral-700 text-[10px] uppercase font-bold tracking-wider font-sans rounded-xl flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#7C7A5A] shrink-0" />
              <span>Cash on Delivery Handling Charge of ₹50 will be collected upon delivery.</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Order Summary & Checkout Action */}
      <div className="lg:col-span-5 space-y-6">
        {/* Items Thumbnail Snapshot Card */}
        <div className="bg-[#F8F2EC] border border-[#ECE9E2] p-6 sm:p-8 rounded-2xl shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#7C7A5A] border-b border-[#ECE9E2] pb-3">
            Items in Order ({cart.items.length})
          </h2>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative h-14 w-11 flex-shrink-0 bg-white border border-brand-black/10 overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="50px"
                  />
                </div>
                <div className="flex-1 min-w-0 font-sans text-xs text-left">
                  <h3 className="font-medium text-brand-black truncate">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Size: {item.sizeName || "Standard"} | Qty: {item.quantity}
                  </p>
                  <p className="text-[10px] font-semibold text-[#7C7A5A] mt-1">
                    ₹{(item.pricePaise / 100).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet Balance Option */}
        {wallet.availableBalancePaise > 0 && (
          <div className="bg-[#F8F2EC] border border-[#ECE9E2] p-5 rounded-2xl shadow-xs space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-black uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#7C7A5A]" /> RC Wallet Balance
              </span>
              <span className="font-sans text-[10px] text-neutral-500 font-semibold">
                Available: ₹{(wallet.availableBalancePaise / 100).toLocaleString("en-IN")}
              </span>
            </div>
            <label className="flex items-center gap-2.5 p-3.5 border border-[#ECE9E2] rounded-xl cursor-pointer bg-white hover:bg-brand-black/5 transition-colors select-none">
              <input
                type="checkbox"
                checked={useWallet}
                onChange={(e) => setUseWallet(e.target.checked)}
                className="accent-[#7C7A5A] cursor-pointer"
              />
              <span className="text-[11px] font-medium text-neutral-700">
                Apply ₹{(maxWalletDeductPaise / 100).toLocaleString("en-IN")} wallet balance
              </span>
            </label>
          </div>
        )}

        {/* Master Editorial Order Summary with Animated Coupon Interaction */}
        <EditorialOrderSummary
          subtotalPaise={subtotalPaise}
          shippingPaise={shippingPaise}
          codFeePaise={codFeePaise}
          appliedWalletPaise={appliedWalletPaise}
          initialCouponCode={appliedCouponCode}
          initialDiscountPaise={discountPaise}
          isCheckoutPending={isPending}
          paymentMethod={paymentMethod}
          onSubmitOrder={handleSubmit}
          showCheckoutButton={true}
        />
      </div>
    </form>
  </>
  );
}
