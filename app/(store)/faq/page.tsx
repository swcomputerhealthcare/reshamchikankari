import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import { HelpCircle, Sparkles, MessageCircle, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions (FAQ) — Resham Chikankari",
  description: "Find answers to frequently asked questions about Resham Chikankari products, sizing, payment methods, shipping, returns, and care instructions.",
};

const FAQS = [
  {
    id: 1,
    q: "What products do you offer?",
    a: "At Resham Chikankari, we offer beautifully crafted chikankari kurtis, suits, and traditional ethnic wear designed to bring together timeless craftsmanship and a graceful, modest look.",
  },
  {
    id: 2,
    q: "What sizes are available?",
    a: "Our sizes may vary depending on the product. Available sizes are mentioned in the individual product description. If you need help choosing your size, please contact us before placing your order.",
  },
  {
    id: 3,
    q: "How do I choose the right size?",
    a: "We recommend checking the size chart provided with the product and comparing the measurements with a garment that fits you well. If you are still unsure, our team will be happy to assist you.",
  },
  {
    id: 4,
    q: "How can I place an order?",
    a: "You can place an order through our available online shopping channels. Select your preferred product, size, and other available options, then proceed with checkout.",
  },
  {
    id: 5,
    q: "What payment methods do you accept?",
    a: "We accept the payment methods displayed at checkout. Available options may vary depending on your location and the payment platform being used.",
  },
  {
    id: 6,
    q: "How long will it take to receive my order?",
    a: "Orders are generally dispatched within the processing time mentioned at the time of purchase. Delivery time depends on your location and the courier service. You will receive tracking details once your order has been dispatched, where applicable.",
  },
  {
    id: 7,
    q: "Do you offer COD?",
    a: "COD availability may vary by location and product. If COD is available for your order, it will be shown during checkout.",
  },
  {
    id: 8,
    q: "Can I cancel or modify my order after placing it?",
    a: "Order cancellation or modification may be possible only before the order has been processed or dispatched. Please contact us as soon as possible if you need to make any changes.",
  },
  {
    id: 9,
    q: "Do you accept returns or exchanges?",
    a: "Our return and exchange policy depends on the product and the reason for return or exchange. Please refer to our Return & Exchange Policy & Request a return policy for complete details.",
  },
  {
    id: 10,
    q: "What if I receive a damaged, defective, or incorrect product?",
    a: "We sincerely apologize if there is an issue with your order. Please contact us as soon as possible after delivery with your order details and clear photographs/video of the product and packaging. Our team will review the issue and assist you according to our applicable policy.",
  },
  {
    id: 11,
    q: "Are the colours exactly the same as shown in the pictures?",
    a: "We make every effort to display product colours as accurately as possible. However, colours may appear slightly different depending on lighting, photography, and your device screen.",
  },
  {
    id: 12,
    q: "Is chikankari handmade?",
    a: "Chikankari is a traditional embroidery craft known for its delicate and intricate work. The level and nature of craftsmanship can vary from one product to another, and product descriptions will indicate relevant details where applicable.",
  },
  {
    id: 13,
    q: "How should I care for my chikankari garments?",
    a: "We recommend following the care instructions provided with your product. Gentle washing and careful handling are generally recommended to help preserve delicate embroidery and fabric.",
  },
  {
    id: 14,
    q: "Can I order a product that is out of stock?",
    a: "If a product is out of stock, you can contact us or follow our social media updates for restock information. Restocking depends on product availability.",
  },
  {
    id: 15,
    q: "Do you offer wholesale or bulk orders?",
    a: "For wholesale or bulk orders, please contact Resham Chikankari directly with your requirements. Our team will provide availability and pricing details.",
  },
  {
    id: 16,
    q: "How can I contact Resham Chikankari?",
    a: "You can contact us through our official customer-support channel or social media page. Please keep your order number ready if your query is regarding an existing order.",
  },
  {
    id: 17,
    q: "Where can I find your policies?",
    a: "Our Privacy Policy, Terms & Conditions, Shipping Policy, and Return & Exchange Policy should be reviewed before placing an order. These policies explain how we handle customer information, orders, payments, shipping, returns, and other important matters.",
  },
];

export default function FAQPage() {
  return (
    <div className="bg-[#FFF9F4] min-h-screen text-brand-black selection:bg-brand-pink/20 pb-24 pt-10">
      <Container className="max-w-3xl font-sans">
        
        {/* Header Title Section */}
        <div className="text-center space-y-3 mb-12 border-b border-brand-black/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7C7A5A]/10 text-[#7C7A5A] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Help Center
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-black">
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="font-display italic text-[#7C7A5A] text-sm sm:text-base max-w-lg mx-auto">
            Modernity of Handcraft, Crafted for a modest and graceful look. 🌸🪡
          </p>
        </div>

        {/* FAQ Cards Accordion Grid */}
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-[#ECE9E2] rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#7C7A5A]/10 text-[#7C7A5A] text-xs font-bold shrink-0 mt-0.5 font-mono">
                  {faq.id}
                </span>
                <div className="space-y-2">
                  <h3 className="font-display text-lg sm:text-xl text-brand-black leading-snug">
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Footer Note & Quick Links */}
        <div className="mt-16 bg-[#F8F2EC] border border-[#ECE9E2] p-8 rounded-3xl text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-[#7C7A5A]">
            <MessageCircle className="w-5 h-5" />
            <span className="font-display text-lg font-semibold">Still have questions?</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Our team is always here to assist you with sizing, customization, or order queries.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs font-semibold uppercase tracking-wider text-[#7C7A5A]">
            <Link href="/contact" className="hover:underline flex items-center gap-1">
              Contact Support &rarr;
            </Link>
            <span>&bull;</span>
            <Link href="/shipping" className="hover:underline">
              Shipping Info
            </Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>

      </Container>
    </div>
  );
}
