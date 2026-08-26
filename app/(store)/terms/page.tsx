import React from "react";
import Container from "@/components/ui/container";

export const metadata = {
  title: "Terms & Conditions — Resham Chikankari",
  description: "Read our Terms and Conditions of service and orders.",
};

export default function TermsPage() {
  return (
    <div className="py-16 sm:py-24 font-sans text-left">
      <Container className="max-w-3xl">
        {/* Editorial Page Header */}
        <div className="mb-12 border-b border-brand-black/5 pb-8">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#77716A] mb-3 block">
            Legal Terms
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-brand-black">
            Terms & Conditions
          </h1>
          <p className="text-xs text-[#77716A] mt-2">
            Last Updated: August 2026
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8 text-neutral-800 text-sm leading-relaxed font-normal">
          <p>
            Welcome to Resham Chikankari. By placing an order with us, contacting us for a purchase, or using our online platforms, you agree to the following Terms & Conditions.
          </p>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              About Our Products
            </h3>
            <p>
              Resham Chikankari offers chikankari suits, kurtis, and other handcrafted/handwork-inspired fashion products.
            </p>
            <p>
              Because our products involve handmade craftsmanship, minor variations in embroidery, thread placement, texture, colour, and finishing may occur. These variations are a natural characteristic of handcrafted products and should not be considered defects.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Product Images & Colours
            </h3>
            <p>
              We strive to display product colours as accurately as possible. However, colours may appear slightly different depending on:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li>Lighting during photography</li>
              <li>Your device or screen settings</li>
              <li>Photography/editing conditions</li>
            </ul>
            <p>
              Therefore, slight colour differences between photographs and the actual product may occur.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Product Availability
            </h3>
            <p>
              All products are subject to availability. If a product becomes unavailable after an order has been placed, we will contact you and may offer an alternative, refund, or cancellation as applicable.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Orders
            </h3>
            <p>
              An order is considered confirmed once the required payment or confirmation has been received and accepted by Resham Chikankari. We reserve the right to cancel or decline an order in circumstances including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li>Product unavailability</li>
              <li>Incorrect pricing or product information</li>
              <li>Suspected fraudulent activity</li>
              <li>Incorrect or incomplete customer information</li>
              <li>Circumstances beyond our reasonable control</li>
            </ul>
            <p>
              If we cancel an order for which payment has already been received, the applicable amount will be refunded through the appropriate payment method.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Pricing
            </h3>
            <p>
              All product prices will be displayed through our relevant sales channel. Prices may change at any time. Any price change will not affect an order that has already been confirmed, except where there is an obvious pricing or technical error.
            </p>
            <p>
              Applicable taxes, shipping charges, or other charges, if any, will be communicated to the customer before order completion.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Payment
            </h3>
            <p>
              We may accept payment through the payment methods made available by Resham Chikankari. Customers are responsible for providing accurate payment and order information.
            </p>
            <p>
              An order will generally be processed only after successful payment confirmation, where advance payment is required.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Shipping & Delivery
            </h3>
            <p>
              Orders will be shipped to the address provided by the customer. Customers are responsible for providing a complete and accurate delivery address and contact number.
            </p>
            <p>
              Delivery times are estimates and may vary because of courier delays, weather conditions, holidays, public events, incorrect address information, remote delivery locations, or other circumstances beyond our control.
            </p>
            <p>
              Resham Chikankari is not responsible for delays caused by third-party courier services after the order has been handed over for delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Inspection on Delivery
            </h3>
            <p>
              Customers are encouraged to inspect their package and product promptly after delivery. If the package appears seriously damaged or the product received is incorrect/damaged, please contact us as soon as possible with photographs/videos and your order details.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Returns & Exchanges
            </h3>
            <p>
              Our return/exchange policy applies separately to each order. Certain products may be non-returnable/non-exchangeable, including products that are customised, altered, or made according to a customer’s requirements.
            </p>
            <p>
              Return/exchange requests must be made within 5 days of delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Refunds
            </h3>
            <p>
              There will be no refunds; only exchanges within 5 days are applicable.
            </p>
            <p>
              If a product is torn or damaged, the money will be refunded or the product will be exchanged in the request a return section. Photos and an unboxing video of the product are mandatory to attach for processing.
            </p>
            <p>
              Where a refund is approved, it will be processed according to our applicable return/refund policy. The time taken for the refunded amount to appear in the customer’s account may depend on the payment provider or bank.
            </p>
            <p>
              Sale products will not be refunded or exchanged.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Incorrect Product or Manufacturing Issue
            </h3>
            <p>
              If you receive an incorrect product or a product with a genuine manufacturing/quality issue, please contact us promptly with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li>Order number</li>
              <li>Photographs/videos of the product (mandatory)</li>
              <li>Your name and email ID</li>
              <li>Description of the issue</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Customer Responsibilities
            </h3>
            <p>
              Customers agree to provide accurate information, including name, phone number, delivery address, email address, size, and other order requirements. Resham Chikankari will not be responsible for delivery problems caused by incorrect customer information.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Intellectual Property
            </h3>
            <p>
              All brand names, logos, photographs, product images, designs, written content, graphics, and other original material belonging to Resham Chikankari are protected by applicable intellectual-property laws. You may not reproduce, copy, modify, distribute, sell, or commercially use our content without prior written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Limitation of Liability
            </h3>
            <p>
              To the extent permitted by applicable law, Resham Chikankari will not be responsible for indirect or consequential losses arising from circumstances outside our reasonable control, including courier delays, technical failures, or force majeure events.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-xl text-brand-black font-semibold">
              Governing Law
            </h3>
            <p>
              These Terms & Conditions shall be governed by the applicable laws of India. Any dispute shall be subject to the jurisdiction of the appropriate courts/authorities as applicable under Indian law.
            </p>
          </section>

          <section className="border-t border-brand-black/5 pt-8 space-y-2">
            <h4 className="font-display text-base text-brand-black font-bold">
              Contact Us
            </h4>
            <p className="text-xs text-[#77716A] leading-relaxed">
              Resham Chikankari<br />
              Email: info@reshamchikankari.com<br />
              WhatsApp: 9625940329<br />
              Instagram: resham.chikankari
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
