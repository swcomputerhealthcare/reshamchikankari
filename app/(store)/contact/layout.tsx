import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Concierge & Lucknow Atelier — Resham Chikankari",
  description:
    "Connect with our patron concierge in Hazratganj, Lucknow. Inquire about bespoke Chikankari shadow-work commissions, sizing advice, wholesale, or order support.",
  alternates: {
    canonical: "https://www.reshamchikankari.com/contact",
  },
  openGraph: {
    title: "Contact Concierge | Resham Chikankari Lucknow",
    description:
      "Get in touch with Resham Chikankari for authentic handcrafted Lucknowi Chikankari inquiries, custom orders, and customer care.",
    url: "https://www.reshamchikankari.com/contact",
    siteName: "Resham Chikankari",
    type: "website",
    images: [
      {
        url: "https://www.reshamchikankari.com/images/contact-atelier.webp",
        width: 1200,
        height: 630,
        alt: "Resham Chikankari Atelier Lucknow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Concierge | Resham Chikankari",
    description: "Connect with our Hazratganj, Lucknow atelier for bespoke orders and assistance.",
    images: ["https://www.reshamchikankari.com/images/contact-atelier.webp"],
  },
};

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Resham Chikankari Contact & Concierge",
  url: "https://www.reshamchikankari.com/contact",
  description: "Official customer concierge and boutique atelier contact for Resham Chikankari.",
  mainEntity: {
    "@type": "ClothingStore",
    name: "Resham Chikankari Atelier",
    telephone: "+91-9125468789",
    email: "support@reshamchikankari.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hazratganj",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      postalCode: "226001",
      addressCountry: "IN",
    },
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      {children}
    </>
  );
}
