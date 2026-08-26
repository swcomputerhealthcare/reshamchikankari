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
      className="relative z-[60] w-full min-h-[75svh] sm:min-h-[85svh] flex flex-col justify-center items-center py-24 sm:py-32 bg-[#FAF7F2] text-[#161616] rounded-t-3xl sm:rounded-t-[36px] shadow-2xl overflow-hidden text-center"
    >
      <Container className="max-w-3xl mx-auto relative z-20">
        <ScrollReveal direction="up">
          <div className="space-y-6">
            <span className="text-[10px] sm:text-xs tracking-[0.25em] font-sans uppercase font-bold text-brand-sage block">
              ATELIER ASSISTANCE & CUSTOM ORDERS
            </span>

            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-brand-black tracking-wider uppercase">
              CONTACT US
            </h2>

            <div className="w-16 h-[1px] bg-brand-sage/40 mx-auto" />

            <p className="font-sans text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Have a bespoke request, sizing inquiry, or questions regarding our Chikankari collections?
            </p>

            <div className="pt-6">
              <Link href="/contact" className="inline-block group">
                <Button
                  variant="primary"
                  size="lg"
                  className="!rounded-none bg-brand-black text-brand-offwhite hover:bg-neutral-800 uppercase tracking-widest text-[10px] sm:text-xs font-bold py-4 px-10 flex items-center gap-2 transition-all group-hover:px-12"
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
