import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";

export const metadata = {
  title: "Frequently Asked Questions — Resham Chikankari",
  description: "Read FAQs about size fits, authentic Lucknowi embroidery, and care directions.",
};

const FAQS = [
  {
    q: "Is your Chikankari 100% hand-embroidered?",
    a: "Yes, absolutely. Every single garment in our collection is hand-embroidered by highly skilled women artisans in and around Lucknow, India. We do not sell machine-made or screen-printed replicas.",
  },
  {
    q: "How do I choose the correct size?",
    a: "We recommend purchasing one size larger than your standard dress size for a comfortable, relaxed fit, which is traditional for Chikankari Kurtas. Refer to our size selectors on product details pages.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping within India takes 5-7 business days. We offer free shipping on all domestic orders above ₹4,000. Orders below ₹4,000 have a shipping charge of ₹150.",
  },
  {
    q: "Do you support returns and exchanges?",
    a: "Yes. We offer exchanges and returns within 7 days of delivery for unworn items with tag inserts. Reach out to care@reshamchikankari.com to start the exchange process.",
  },
  {
    q: "How should I wash my Kurti?",
    a: "Dry cleaning is highly recommended, particularly for georgette or heavily embroidered cotton. For cotton, you can also hand wash gently in cold water with mild liquid detergent and iron on the reverse side.",
  },
];

export default function FAQPage() {
  return (
    <div className="bg-brand-offwhite min-h-screen text-brand-black selection:bg-brand-pink/20 pb-24 pt-10">

      <Container className="max-w-2xl font-sans">
        <h1 className="font-display text-4xl text-brand-black mb-8 border-b border-brand-black/5 pb-4">
          Frequently Asked Questions
        </h1>
        
        <div className="space-y-6">
          {FAQS.map((faq, index) => (
            <div key={index} className="space-y-2 border-b border-brand-black/5 pb-6 last:border-none">
              <h3 className="font-display text-lg text-brand-black">
                {faq.q}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
