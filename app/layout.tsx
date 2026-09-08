import type { Metadata, Viewport } from "next";
import { Gilda_Display, Inter, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getCartDetails } from "@/lib/cart";
import { getWishlistItems } from "@/lib/wishlist";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import PrefetchManager from "@/components/performance/PrefetchManager";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { PageTransitionProvider } from "@/components/transitions/PageTransition";
import SitePreloader from "@/components/transitions/SitePreloader";
import AuthCodeHandler from "@/components/auth/AuthCodeHandler";

const gildaDisplay = Gilda_Display({
  weight: "400",
  variable: "--font-gilda-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const tiroDevanagari = Tiro_Devanagari_Hindi({
  weight: "400",
  variable: "--font-tiro-devanagari",
  subsets: ["devanagari", "latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#7C7A5A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.reshamchikankari.com"),
  title: {
    default: "Resham Chikankari — Authentic Handcrafted Lucknowi Kurtis & Suits",
    template: "%s | Resham Chikankari",
  },
  description:
    "Discover authentic GI-certified Lucknowi Chikankari kurtis, suits, and co-ord sets handcrafted by master women artisans in Lucknow. Pure modal, georgette, and chanderi silk with exquisite shadow work and mukaish embellishments.",
  keywords: [
    "Lucknowi Chikankari Kurtis",
    "Authentic Lucknow Chikankari",
    "Handcrafted Chikankari Online",
    "Chikankari Kurta Set",
    "Chanderi Silk Chikankari",
    "Georgette Chikankari Kurti",
    "Mukaish Work Kurti",
    "Pure Muslin Chikankari",
    "GI Certified Lucknow Chikankari",
    "Lucknow Chikankari Boutique",
    "Handmade Chikankari Lucknow",
    "Indian Ethnic Wear Online",
    "Designer Chikankari Suits",
    "Resham Chikankari",
  ],
  alternates: {
    canonical: "https://www.reshamchikankari.com",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.reshamchikankari.com",
    siteName: "Resham Chikankari",
    title: "Resham Chikankari — Authentic Handcrafted Lucknowi Kurtis & Suits",
    description:
      "Authentic GI-certified Lucknowi Chikankari kurtis, co-ord sets, and suits handcrafted by master women artisans in Lucknow.",
    images: [
      {
        url: "/images/about.png",
        width: 1200,
        height: 630,
        alt: "Resham Chikankari — Handcrafted Lucknowi Kurtis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resham Chikankari — Authentic Handcrafted Lucknowi Kurtis & Suits",
    description:
      "Authentic GI-certified Lucknowi Chikankari kurtis, co-ord sets, and suits handcrafted by master women artisans in Lucknow.",
    images: ["/images/about.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  other: {
    "format-detection": "telephone=no",
    "geo.region": "IN-UP",
    "geo.placename": "Lucknow",
    "geo.position": "26.8467;80.9462",
    ICBM: "26.8467, 80.9462",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Resham Chikankari",
  url: "https://www.reshamchikankari.com",
  logo: "https://www.reshamchikankari.com/favicon.ico",
  image: "https://www.reshamchikankari.com/images/about.png",
  description:
    "Authentic GI-certified Lucknowi Chikankari kurtis, co-ord sets, and ethnic wear handcrafted by master women artisans in Lucknow.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Hazratganj",
    addressLocality: "Lucknow",
    addressRegion: "Uttar Pradesh",
    postalCode: "226001",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9125468789",
    contactType: "customer service",
    email: "support@reshamchikankari.com",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: ["https://instagram.com/reshamchikankari"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Resham Chikankari",
  url: "https://www.reshamchikankari.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.reshamchikankari.com/shop?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: "Resham Chikankari Atelier",
  image: "https://www.reshamchikankari.com/images/about.png",
  url: "https://www.reshamchikankari.com",
  telephone: "+91-9125468789",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Hazratganj",
    addressLocality: "Lucknow",
    addressRegion: "Uttar Pradesh",
    postalCode: "226001",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 26.8467,
    longitude: 80.9462,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "20:00",
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col text-brand-black bg-[#FFF9F4]">
        <AuthCodeHandler />
        <WishlistProvider initialWishlistIds={wishlistIds}>
          <CartProvider initialCart={cartDetails}>
            <PrefetchManager />
            <SmoothScrollProvider>
              <SitePreloader>
                <PageTransitionProvider>{children}</PageTransitionProvider>
              </SitePreloader>
            </SmoothScrollProvider>
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
