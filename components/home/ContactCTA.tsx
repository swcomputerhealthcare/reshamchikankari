'use client';

import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import ScrollReveal from "@/components/performance/ScrollReveal";

export default function ContactCTA() {
  return (
    <section
      id="contact"
      className="relative z-10 w-full flex flex-col justify-center py-20 sm:py-28 bg-[#FAF7F2] text-[#161616] border-t border-[#161616]/10 text-center overflow-hidden select-none"
    >
      <Container className="max-w-4xl mx-auto relative z-20">
        <ScrollReveal direction="up">
          <div className="space-y-7 max-w-2xl mx-auto">
            <span className="text-[10px] sm:text-xs tracking-[0.25em] font-sans uppercase font-bold text-brand-sage block">
              ATELIER ASSISTANCE & CUSTOM ORDERS
            </span>

            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-brand-black tracking-wider uppercase leading-none">
              CONTACT US
            </h2>

            <div className="w-16 h-[1px] bg-brand-sage/30 mx-auto my-4" />

            <p className="font-sans text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Have a bespoke request, sizing inquiry, or questions regarding our hand-embroidered Awadh Chikankari collections?
            </p>

            <div className="pt-4">
              <Link href="/contact" className="inline-block group">
                <Button
                  variant="primary"
                  size="lg"
                  className="!rounded-none bg-brand-black text-brand-offwhite hover:bg-neutral-800 uppercase tracking-widest text-[10px] sm:text-xs font-bold py-4 px-10 flex items-center gap-2 transition-all group-hover:px-12 cursor-pointer shadow-md"
                >
                  <span>Get In Touch</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
