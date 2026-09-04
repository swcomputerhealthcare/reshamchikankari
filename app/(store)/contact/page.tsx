'use client';

import React, { useState } from "react";
import Image from "next/image";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { Mail, MessageCircle, Phone, MapPin, Clock, Send, CheckCircle2, Sparkles } from "lucide-react";

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormState({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    }, 1200);
  };

  return (
    <div className="bg-[#FFF9F4] text-[#161616] min-h-screen py-12 sm:py-20 font-sans">
      <Container className="space-y-16 sm:space-y-24">
        {/* 1. HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#E694AA] uppercase block">
            ATELIER CONCIERGE & HERITAGE ASSISTANCE
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-[#7C7A5A] leading-tight">
            Connect with Our Lucknow Atelier
          </h1>
          <div className="w-16 h-[1px] bg-[#7C7A5A]/30 mx-auto my-3" />
          <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xl mx-auto">
            Whether inquiring about bespoke shadow-work commissions, sizing guidance, or global express shipping, our patron specialists are at your service.
          </p>
        </div>

        {/* 2. MAIN 2-COLUMN SECTION: Form + Contact Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT: Complete Contact Form (Always Visible) */}
          <div className="lg:col-span-7 bg-[#F8F2EC] border border-[#ECE9E2] rounded-2xl p-6 sm:p-10 shadow-xs text-left">
            <div className="mb-8 border-b border-[#ECE9E2] pb-5">
              <h2 className="font-display text-2xl sm:text-3xl text-[#7C7A5A] mb-1">
                Send an Inquiry
              </h2>
              <p className="text-xs text-neutral-500 font-sans">
                Fill out the form below. Our atelier concierge will respond within 24 operational hours.
              </p>
            </div>

            {isSuccess ? (
              <div className="text-center py-12 px-6 bg-[#7C7A5A]/5 rounded-xl border border-[#7C7A5A]/10 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#7C7A5A] mx-auto" />
                <h3 className="font-display text-2xl text-[#7C7A5A]">Inquiry Received</h3>
                <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Resham Chikankari. A patron concierge specialist will review your request and contact you shortly.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-xs font-bold uppercase tracking-widest text-[#7C7A5A] underline cursor-pointer border-none bg-transparent hover:text-black transition-colors"
                  >
                    Send another inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={formState.name}
                      onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3.5 bg-[#FFF9F4] border border-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7C7A5A] text-xs text-[#161616]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="ananya@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3.5 bg-[#FFF9F4] border border-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7C7A5A] text-xs text-[#161616]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                      WhatsApp / Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formState.phone}
                      onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3.5 bg-[#FFF9F4] border border-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7C7A5A] text-xs text-[#161616]"
                    />
                  </div>

                  {/* Subject Topic */}
                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                      Inquiry Topic
                    </label>
                    <select
                      id="subject"
                      value={formState.subject}
                      onChange={(e) => setFormState((prev) => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-3.5 bg-[#FFF9F4] border border-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7C7A5A] text-xs text-[#161616] cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Sizing & Fit Advice">Sizing & Fit Advice</option>
                      <option value="Bespoke & Custom Bridal Order">Bespoke & Custom Order</option>
                      <option value="Shipping & International Delivery">Shipping & Delivery</option>
                      <option value="Press & Collaboration">Press & Collaboration</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    placeholder="How may we assist your Resham Chikankari experience?"
                    value={formState.message}
                    onChange={(e) => setFormState((prev) => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-[#FFF9F4] border border-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7C7A5A] text-xs text-[#161616] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#7C7A5A] text-[#FFF9F4] hover:bg-black uppercase tracking-[0.18em] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
                >
                  {isSubmitting ? "Transmitting..." : "Transmit Inquiry"} <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            )}
          </div>

          {/* RIGHT: Direct Channels & Atelier Address Cards */}
          <div className="lg:col-span-5 space-y-8 text-left">
            
            {/* Direct Channels Card */}
            <div className="bg-[#F8F2EC] border border-[#ECE9E2] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
              <h3 className="font-display text-xl sm:text-2xl text-[#7C7A5A] border-b border-[#ECE9E2] pb-3">
                Direct Channels
              </h3>

              {/* Email */}
              <a href="mailto:concierge@reshamchikankari.com" className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#7C7A5A]/10 text-[#7C7A5A] group-hover:bg-[#E694AA]/20 group-hover:text-[#E694AA] flex items-center justify-center shrink-0 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-0.5">
                    EMAIL CONCIERGE
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-[#161616] group-hover:text-[#7C7A5A] transition-colors">
                    concierge@reshamchikankari.com
                  </p>
                </div>
              </a>

              {/* WhatsApp */}
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#7C7A5A]/10 text-[#7C7A5A] group-hover:bg-[#E694AA]/20 group-hover:text-[#E694AA] flex items-center justify-center shrink-0 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-0.5">
                    WHATSAPP PATRON CARE
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-[#161616] group-hover:text-[#7C7A5A] transition-colors">
                    +91 98765 43210
                  </p>
                </div>
              </a>

              {/* Phone Direct */}
              <a href="tel:+919876543210" className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#7C7A5A]/10 text-[#7C7A5A] group-hover:bg-[#E694AA]/20 group-hover:text-[#E694AA] flex items-center justify-center shrink-0 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-0.5">
                    TELEPHONE HELPLINE
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-[#161616] group-hover:text-[#7C7A5A] transition-colors">
                    +91 (0522) 261-0099
                  </p>
                </div>
              </a>

              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#7C7A5A]/10 text-[#7C7A5A] group-hover:bg-[#E694AA]/20 group-hover:text-[#E694AA] flex items-center justify-center shrink-0 transition-colors">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-0.5">
                    INSTAGRAM JOURNAL
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-[#161616] group-hover:text-[#7C7A5A] transition-colors">
                    @reshamchikankari.official
                  </p>
                </div>
              </a>
            </div>

            {/* Atelier Address & Hours Card */}
            <div className="bg-[#7C7A5A] text-[#FFF9F4] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex items-center gap-2 text-[#E694AA]">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  HERITAGE FLAGSHIP STORE
                </span>
              </div>
              <h4 className="font-display text-xl sm:text-2xl text-[#FFF9F4]">
                Lucknow Atelier & Boutique
              </h4>
              <div className="space-y-3 font-sans text-xs text-[#FFF9F4]/80 leading-relaxed">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#E694AA] shrink-0 mt-0.5" />
                  <span>
                    Chowk Heritage Precinct, Hazratganj Extension,<br />
                    Lucknow, Uttar Pradesh 226001, India
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Clock className="w-4 h-4 text-[#E694AA] shrink-0" />
                  <span>Mon – Sat: 10:30 AM – 8:00 PM IST</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. EDITORIAL PHOTOGRAPHY BANNER */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-2xl overflow-hidden border border-[#ECE9E2] shadow-xs">
          <Image
            src="/images/reshamchikankari/New%20folder%205/IMG_3230.JPG"
            alt="Hand-embroidered Lucknowi Chikankari craftsmanship"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-12 text-left text-[#FFF9F4]">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#E694AA] mb-1">
              HERITAGE CRAFTSMANSHIP
            </span>
            <h3 className="font-display text-2xl sm:text-4xl text-[#FFF9F4]">
              Centuries of Lucknowi Shadow-Work
            </h3>
            <p className="font-sans text-xs text-[#FFF9F4]/75 max-w-md mt-1 leading-relaxed">
              Every stitch is handcrafted by master women artisans preserving Awadh heritage for generations.
            </p>
          </div>
        </div>

        {/* 4. FREQUENTLY ASKED QUESTIONS */}
        <div className="space-y-8 text-left border-t border-[#ECE9E2] pt-16">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E694AA]">
              QUICK ASSISTANCE
            </span>
            <h3 className="font-display text-3xl text-[#7C7A5A]">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-[#F8F2EC] border border-[#ECE9E2] rounded-xl p-6 space-y-2">
              <h4 className="font-display text-lg text-[#161616]">How long does domestic & global shipping take?</h4>
              <p className="font-sans text-xs text-neutral-600 leading-relaxed">
                Domestic orders across India dispatch within 24-48 hours and arrive in 3-5 business days. International express shipments deliver within 5-8 business days.
              </p>
            </div>

            <div className="bg-[#F8F2EC] border border-[#ECE9E2] rounded-xl p-6 space-y-2">
              <h4 className="font-display text-lg text-[#161616]">Do you accept custom bridal & sizing orders?</h4>
              <p className="font-sans text-xs text-neutral-600 leading-relaxed">
                Yes, our Lucknow atelier crafts bespoke Tepchi, Bakhiya & Phanda shadow-work ensembles. Select &quot;Bespoke Order&quot; in the inquiry form above to schedule a private consultation.
              </p>
            </div>

            <div className="bg-[#F8F2EC] border border-[#ECE9E2] rounded-xl p-6 space-y-2">
              <h4 className="font-display text-lg text-[#161616]">How do I ensure authentic 100% handcrafted Chikankari?</h4>
              <p className="font-sans text-xs text-neutral-600 leading-relaxed">
                Every Resham Chikankari garment includes an authentic GI craftsmanship seal and artisan detail card certifying genuine Lucknow hand embroidery.
              </p>
            </div>

            <div className="bg-[#F8F2EC] border border-[#ECE9E2] rounded-xl p-6 space-y-2">
              <h4 className="font-display text-lg text-[#161616]">What is your exchange and return policy?</h4>
              <p className="font-sans text-xs text-neutral-600 leading-relaxed">
                We offer hassle-free 7-day returns and size exchanges for all unworn items. Contact our concierge team via WhatsApp or email for instant return pickup.
              </p>
            </div>
          </div>
        </div>

      </Container>
    </div>
  );
}
