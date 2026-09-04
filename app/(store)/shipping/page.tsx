import React from "react";
import Container from "@/components/ui/container";

export const metadata = {
  title: "Shipping & Returns — Resham Chikankari",
  description: "Read our processing timelines, domestic delivery details, and 5-day exchange policies.",
};

export default function ShippingPage() {
  return (
    <div className="py-16 sm:py-24 font-sans text-left">
      <Container className="max-w-4xl">
        {/* Editorial Page Header */}
        <div className="mb-16 border-b border-brand-black/5 pb-8">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#77716A] mb-3 block">
            Customer Support
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-brand-black">
            Shipping & Returns
          </h1>
          <p className="text-xs text-[#77716A] mt-2">
            Details regarding delivery, tracking, and product exchanges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
          {/* Column 1: Shipping Policy */}
          <div className="space-y-8">
            <h2 className="font-display text-2xl text-brand-black border-b border-brand-black/5 pb-3">
              Shipping Policy
            </h2>

            <section className="space-y-3">
              <h3 className="font-semibold text-brand-black text-sm uppercase tracking-wider">
                Order Processing
              </h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                Orders are usually processed and dispatched within 2–4 business days after confirmation of payment. Orders placed on Sundays or public holidays will be processed on the next working day.
              </p>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                During sales, festive seasons, or high-volume periods, dispatch may take a little longer. We appreciate your patience and understanding.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-brand-black text-sm uppercase tracking-wider">
                Delivery Time
              </h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                Within India: Orders are generally delivered within 7–10 business days after dispatch.
              </p>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                Delivery timelines may vary depending on your location, courier availability, weather conditions, or other circumstances beyond our control. Once your order has been dispatched, you will receive tracking details wherever available.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-brand-black text-sm uppercase tracking-wider">
                Shipping Charges
              </h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                Shipping charges, if applicable, will be displayed at checkout before you complete your purchase. Any applicable promotional free-shipping offers will be clearly mentioned on our website.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-brand-black text-sm uppercase tracking-wider">
                Incorrect Address
              </h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                Please make sure your shipping address, phone number, and PIN code are entered correctly while placing your order. Resham Chikankari will not be responsible for delays or additional charges resulting from an incorrect or incomplete address provided by the customer.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-brand-black text-sm uppercase tracking-wider">
                Delayed, Lost or Damaged Packages
              </h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                While we work with reliable courier partners, occasional delays may occur due to circumstances beyond our control. If your package arrives damaged, please contact us as soon as possible with unboxing photos/videos and your order details so that we can assist you.
              </p>
            </section>
          </div>

          {/* Column 2: Return & Exchange Policy */}
          <div className="space-y-8">
            <h2 className="font-display text-2xl text-brand-black border-b border-brand-black/5 pb-3">
              Exchange & Return Policy
            </h2>

            <section className="space-y-3">
              <h3 className="font-semibold text-brand-black text-sm uppercase tracking-wider">
                5-Day Exchange Window
              </h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                Exchange requests must be raised within 5 days of receiving your order.
              </p>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed font-semibold text-[#7C7A5A]">
                We currently offer exchanges only. We do not accept returns for refunds, unless the product received is defective, damaged, or incorrect.
              </p>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                The product must be unused, unworn, unwashed, unaltered, and in its original condition, with all tags and packaging intact. Products showing signs of use, damage, washing, alteration, or missing tags may not be eligible for exchange.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-brand-black text-sm uppercase tracking-wider">
                How to Request an Exchange
              </h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                To request an exchange, please contact us within 5 days of delivery with your order number, reason for exchange, and clear photographs/videos of the product if requested by our team.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-brand-black text-sm uppercase tracking-wider">
                Damaged or Incorrect Product
              </h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery with clear photographs/video of the package and product. We will review the issue and, if approved, arrange a suitable resolution.
              </p>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed italic">
                Photos and unboxing video of the product are mandatory to attach for processing.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-brand-black text-sm uppercase tracking-wider">
                Non-Exchangeable Items
              </h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                Exchange requests are not accepted for products worn, washed, altered, or damaged after delivery. Items without original tags, final sale products, and discounted sale items are not eligible for refunds or exchanges.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-brand-black text-sm uppercase tracking-wider">
                Exchange Shipping
              </h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                For approved exchanges due to size issues or change of preference, applicable return/re-shipping charges may be borne by the customer. If the item received is wrong, damaged, or defective, Resham Chikankari will assist with the resolution as applicable.
              </p>
            </section>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-brand-black/5 mt-16 pt-12 text-center text-[#77716A] space-y-4">
          <p className="font-sans text-[11px] uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
            Our Chikankari pieces represent the beautiful work of skilled artisans, and we take care to pack each order with the same love and attention that goes into creating it.
          </p>
          
          <div className="text-xs space-y-1">
            <span className="font-display font-semibold text-brand-black block">Resham Chikankari</span>
            <span className="text-[10px] block">Email: info@reshamchikankari.com | WhatsApp: 9625940329</span>
          </div>
        </div>
      </Container>
    </div>
  );
}
