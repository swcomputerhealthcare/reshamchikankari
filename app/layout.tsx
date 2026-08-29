import type { Metadata } from "next";
import { Gilda_Display, Inter, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const gildaDisplay = Gilda_Display({
  weight: "400",
  variable: "--font-gilda-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Gilda Display has no Devanagari coverage, so चिकनकारी would fall back to a
// system face. Tiro Devanagari Hindi is a display serif designed for the script,
// which keeps the hero title as the visual hero rather than an accident.
const tiroDevanagari = Tiro_Devanagari_Hindi({
  weight: "400",
  variable: "--font-tiro-devanagari",
  subsets: ["devanagari", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resham Chikankari — Handcrafted Lucknowi Kurtis",
  description: "Discover premium hand-embroidered Lucknowi Chikankari Kurtis. Merging traditional Indian craftsmanship with contemporary editorial style.",
  keywords: ["chikankari", "kurtis", "lucknowi chikankari", "indian wear", "embroidered kurtis"],
  openGraph: {
    title: "Resham Chikankari — Handcrafted Lucknowi Kurtis",
    description: "Premium hand-embroidered Lucknowi Chikankari Kurtis. Traditional craftsmanship meets contemporary design.",
    type: "website",
    locale: "en_IN",
  },
};

import { getCartDetails } from "@/lib/cart";
import { getWishlistItems } from "@/lib/wishlist";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import PrefetchManager from "@/components/performance/PrefetchManager";

import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { PageTransitionProvider } from "@/components/transitions/PageTransition";
import SitePreloader from "@/components/transitions/SitePreloader";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [cartDetails, wishlistIds] = await Promise.all([
    getCartDetails(),
    getWishlistItems(),
  ]);

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        gildaDisplay.variable,
        inter.variable,
        tiroDevanagari.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col text-brand-black bg-[#FAF7F2]">
        <WishlistProvider initialWishlistIds={wishlistIds}>
          <CartProvider initialCart={cartDetails}>
            <PrefetchManager />
            <SmoothScrollProvider>
              <SitePreloader>
                <PageTransitionProvider>
                  {children}
                </PageTransitionProvider>
              </SitePreloader>
            </SmoothScrollProvider>
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
