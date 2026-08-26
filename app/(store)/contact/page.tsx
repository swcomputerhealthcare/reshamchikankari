'use client';

import React, { useState } from "react";
import Image from "next/image";
import { Mail, MessageCircle, Send, CheckCircle2, ArrowRight } from "lucide-react";

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
  const [query, setQuery] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.name || !query.email || !query.message) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setQuery({ name: "", email: "", message: "" });
    }, 1200);
  };

  return (
    <div className="bg-[#FFF9F4] min-h-[calc(100vh-80px)] flex flex-col justify-between pt-12 md:pt-20 pb-16 px-5 sm:px-8 lg:px-16 max-w-[1440px] mx-auto w-full font-sans">
      {/* Upper Grid Layout */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Left Hero / Poster Headline */}
        <div className="flex flex-col space-y-8 text-left">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#3F5031]">
            Artisanship & Concierge
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-[#3F5031]">
            Have something<br />
            you&apos;d like to ask?
          </h1>
          <div className="pt-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#3F5031] text-[#FFF9F4] font-sans text-xs font-semibold uppercase tracking-[0.15em] px-8 py-4 hover:bg-black transition-all duration-300 shadow-xs cursor-pointer border-none flex items-center gap-2 group"
            >
              {showForm ? "Hide Contact Form" : "Get in Touch"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right Contact Details List */}
        <div className="flex flex-col space-y-8 md:border-l border-[#161616]/15 md:pl-16 md:py-8 text-left">
          {/* EMAIL */}
          <a
            href="mailto:concierge@luckhnowi.com"
            className="flex items-start space-x-4 group cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#3F5031]/5 group-hover:bg-[#E58FA7]/15 text-[#3F5031] group-hover:text-[#E58FA7] flex items-center justify-center transition-colors flex-shrink-0 mt-0.5">
              <Mail className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#75786e] mb-1">
                EMAIL
              </p>
              <p className="text-base sm:text-lg text-[#161616] group-hover:underline underline-offset-4 font-medium transition-all">
                concierge@luckhnowi.com
              </p>
            </div>
          </a>

          {/* WHATSAPP */}
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start space-x-4 group cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#3F5031]/5 group-hover:bg-[#E58FA7]/15 text-[#3F5031] group-hover:text-[#E58FA7] flex items-center justify-center transition-colors flex-shrink-0 mt-0.5">
              <MessageCircle className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#75786e] mb-1">
                WHATSAPP
              </p>
              <p className="text-base sm:text-lg text-[#161616] group-hover:underline underline-offset-4 font-medium transition-all">
                +91 98765 43210
              </p>
            </div>
          </a>

          {/* INSTAGRAM */}
          <a
            href="https://instagram.com/luckhnowi.official"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start space-x-4 group cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#3F5031]/5 group-hover:bg-[#E58FA7]/15 text-[#3F5031] group-hover:text-[#E58FA7] flex items-center justify-center transition-colors flex-shrink-0 mt-0.5">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#75786e] mb-1">
                INSTAGRAM
              </p>
              <p className="text-base sm:text-lg text-[#161616] group-hover:underline underline-offset-4 font-medium transition-all">
                @luckhnowi.official
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Collapsible / Expandable Contact Form */}
      {showForm && (
        <div className="max-w-2xl mx-auto w-full mt-12 bg-white/70 backdrop-blur-sm border border-[#161616]/10 rounded-2xl p-6 sm:p-10 shadow-xs animate-in fade-in slide-in-from-bottom-4 duration-300 text-left">
          <div className="mb-6 border-b border-[#161616]/10 pb-4">
            <h3 className="font-display text-2xl text-[#3F5031]">Send a Message</h3>
            <p className="text-xs text-[#75786e] mt-1">Our concierge team will respond within 24 operational hours.</p>
          </div>

          {isSent ? (
            <div className="text-center py-10 px-4 bg-[#3F5031]/5 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-[#3F5031] mx-auto mb-3" />
              <h4 className="font-display text-xl text-[#3F5031] mb-2">Message Received</h4>
              <p className="text-xs text-[#161616]/70 max-w-sm mx-auto leading-relaxed">
                Thank you for inquiring. A Resham Chikankari patron specialist will connect with you shortly.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="mt-6 text-xs uppercase tracking-widest font-bold underline text-[#3F5031] cursor-pointer border-none bg-transparent"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-[#75786e]">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Full name"
                    value={query.name}
                    onChange={(e) => setQuery((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#FFF9F4] border border-[#161616]/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3F5031] text-sm text-[#161616]"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-[#75786e]">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Email address"
                    value={query.email}
                    onChange={(e) => setQuery((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#FFF9F4] border border-[#161616]/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3F5031] text-sm text-[#161616]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-widest text-[#75786e]">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="How can we assist you?"
                  value={query.message}
                  onChange={(e) => setQuery((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#FFF9F4] border border-[#161616]/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3F5031] text-sm text-[#161616] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-4 bg-[#3F5031] text-[#FFF9F4] font-sans text-xs font-semibold uppercase tracking-[0.15em] rounded-xl hover:bg-black transition-all cursor-pointer border-none flex items-center justify-center gap-2"
              >
                {isSending ? "Sending..." : "Submit Inquiry"} <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Decorative Photography Banner */}
      <div className="w-full mt-16 sm:mt-24 relative overflow-hidden h-[260px] sm:h-[360px] bg-[#efeee9] rounded-2xl border border-[#161616]/10 shadow-xs">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwft7wX5o83rhrOGqsbTQMbfTpVgCxLDq1jFI7QMjOHsdzeTW_CVpR6nSZl8lUw8sK5G3cRrnBW_YyfwWQ-kYDqRsjbP5Np3xBqFwN3AxJhBeFNKld2TTjvsO8fpWeVkjmeHWOKh-Iy2PNY3rUXOBKOQbhxImzmi2GsKug-30WVrU0GlI3WXm3DIuXbxVJ_ZHYm3UNLQayTMT-nTJoEx3zozEzuBJqJsvtZ14aHxNcGWHCAJZ19Am3"
          alt="White-on-white Chikankari embroidery craftsmanship"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 text-[#FFF9F4] text-left">
          <p className="font-display text-lg sm:text-2xl drop-shadow-sm">Hand-Embroidered Muslin Craftsmanship</p>
          <p className="text-[10px] sm:text-xs tracking-widest font-sans uppercase text-[#FFF9F4]/80">Lucknow, India</p>
        </div>
      </div>
    </div>
  );
}
