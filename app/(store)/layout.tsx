import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementCarousel from "@/components/layout/AnnouncementCarousel";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import { getCachedSiteSettings } from "@/lib/settings";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default async function StoreLayout({ children }: StoreLayoutProps) {
  let announcement = "Free international shipping on purchase of $200 and above | Hassle-free exchange within 5 days of delivery | 100% Authentic Hand-Embroidered Lucknowi Chikankari Direct from Lucknow";

  try {
    const settings = await getCachedSiteSettings();
    if (settings?.announcementBarText) {
      announcement = settings.announcementBarText;
    }
  } catch (err) {
    // Fallback to default announcement
  }

  return (
    <div className="flex flex-col min-h-screen text-brand-black selection:bg-[#E694AA]/20 bg-[#FFF9F4]">
      {/* Sticky Everywhere Announcement Bar & Header */}
      <div className="sticky top-0 left-0 right-0 z-[100] w-full shadow-2xs">
        <AnnouncementCarousel initialText={announcement} />
        <Header />
      </div>

      {/* Page Content */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* Global Canonical Footer */}
      <Footer />

      {/* Floating WhatsApp Contact Button */}
      <FloatingWhatsApp />
    </div>
  );
}
