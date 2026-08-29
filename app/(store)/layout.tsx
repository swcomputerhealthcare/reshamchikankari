import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen text-brand-black selection:bg-[#E694AA]/20 bg-[#FFF9F4]">

      {/* Announcement Bar */}
      <div className="w-full bg-brand-black text-brand-offwhite text-[10px] sm:text-xs tracking-widest text-center py-2.5 uppercase font-sans font-medium px-4">
        Free Shipping on Orders Above ₹4,000 | Handcrafted with Love in Lucknow
      </div>

      {/* Global Canonical Header */}
      <Header />

      {/* Page Content */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* Global Canonical Footer */}
      <Footer />
    </div>
  );
}
