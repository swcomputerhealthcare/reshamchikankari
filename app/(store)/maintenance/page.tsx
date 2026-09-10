import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import { Wrench, Mail, Phone, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Under Maintenance — Resham Chikankari",
  description: "Resham Chikankari is currently undergoing scheduled maintenance and updates. We will be back shortly with exclusive hand-crafted collections.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-brand-offwhite py-16 px-4 selection:bg-brand-pink/20">
      <Container className="max-w-2xl text-center">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-pink/10 border border-brand-pink/30 px-4 py-1.5 rounded-full text-brand-pink text-xs uppercase font-semibold tracking-widest mb-8">
          <Wrench className="w-3.5 h-3.5" />
          <span>Scheduled Upgrades in Progress</span>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-black tracking-tight leading-tight mb-6">
          We&apos;re Refining Our Atelier Experience
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-10">
          Resham Chikankari is currently undergoing brief technical maintenance to bring you an improved shopping experience with our fine hand-embroidery collections.
        </p>

        {/* Details Card */}
        <div className="bg-white border border-brand-black/10 rounded-xl p-6 sm:p-8 shadow-sm text-left mb-10 space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-neutral-100">
            <div className="p-3 bg-brand-pink/10 rounded-lg text-brand-pink shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-brand-black text-sm uppercase tracking-wider mb-1">
                Existing Orders are Safe
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                All placed orders and pending dispatches are being processed as normal. Shiprocket tracking updates continue to update automatically.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a
              href="mailto:sw.computerhealthcare@gmail.com"
              className="flex items-center gap-3 p-3.5 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 rounded-lg transition-colors group"
            >
              <Mail className="w-4 h-4 text-brand-pink shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Customer Care Email</div>
                <div className="text-xs font-medium text-brand-black group-hover:text-brand-pink transition-colors">
                  sw.computerhealthcare@gmail.com
                </div>
              </div>
            </a>

            <a
              href="https://wa.me/918999263389"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 rounded-lg transition-colors group"
            >
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">WhatsApp Support</div>
                <div className="text-xs font-medium text-brand-black group-hover:text-emerald-600 transition-colors">
                  +91 8999263389
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-neutral-500">
          <span>Are you an administrator?</span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-brand-black hover:text-brand-pink transition-colors"
          >
            <span>Access Admin Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
