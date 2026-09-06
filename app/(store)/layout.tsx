import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementCarousel from "@/components/layout/AnnouncementCarousel";
import { getCachedSiteSettings } from "@/lib/settings";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default async function StoreLayout({ children }: StoreLayoutProps) {
  let announcement = "Hassle-free exchange within 5 days of delivery | Free shipping on international orders of $200 and above | Complimentary Lucknow Express Delivery on orders above ₹4,000";

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
    </div>
  );
}
