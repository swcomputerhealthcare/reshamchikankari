import React from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/container";
import HeaderNavigation from "@/components/layout/header-navigation";

export const metadata = {
  title: "Curated Collections — Resham Chikankari",
  description: "Browse the handcrafted Lucknowi Chikankari edits for cotton, georgette, and pastel designs.",
};

const COLLECTIONS = [
  {
    id: "col_1",
    name: "Kurtis & Kurtas",
    slug: "kurtis-kurtas",
    description: "Traditional hand-embroidered Lucknowi Kurtis and long Kurtas featuring heritage Chikankari work.",
    image: "/images/reshamchikankari/New folder 3/IMG_3001.JPG",
    count: "3 Items",
  },
  {
    id: "col_2",
    name: "Kurtas & Co-ord Sets",
    slug: "coord-sets",
    description: "Modern two-piece and three-piece co-ord sets styled with subtle Chikankari borders.",
    image: "/images/reshamchikankari/New folder/IMG_2685.JPG",
    count: "1 Items",
  },
  {
    id: "col_3",
    name: "Bottom Wear",
    slug: "bottom-wear",
    description: "Premium Chikankari hand-embroidered straight pants, flared palazzos, and salwar bottoms.",
    image: "/images/reshamchikankari/New folder 21/IMG_3040.JPG",
    count: "1 Items",
  },
];

export default function CollectionsPage() {
  return (
    <div className="bg-brand-offwhite min-h-screen text-brand-black selection:bg-brand-pink/20 pb-24 pt-10">

      {/* Hero Header */}
      <section className="text-center max-w-xl mx-auto mb-20 px-4">
        <span className="text-[10px] sm:text-xs tracking-widest font-sans uppercase font-bold text-brand-sage mb-3 block">
          THE RESHAM EDITS
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-brand-black mb-4">
          Curated Collections
        </h1>
        <div className="flex items-center justify-center gap-3 my-4 text-brand-sage/60">
          <div className="h-[1px] w-8 bg-current"></div>
          <span className="text-xs">✦</span>
          <div className="h-[1px] w-8 bg-current"></div>
        </div>
        <p className="font-sans text-xs text-neutral-500 tracking-wide uppercase">
          Artisanal Lucknowi heritage sorted for every mood and season.
        </p>
      </section>

      {/* Collections Grid Layout */}
      <Container className="max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLLECTIONS.map((col) => (
            <Link key={col.id} href={`/shop/${col.slug}`} className="group relative block aspect-[3/4] overflow-hidden border border-brand-black/5 rounded-[24px] shadow-xs">
              <Image
                src={col.image}
                alt={col.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-brand-black/90 via-brand-black/35 to-transparent flex flex-col justify-end p-8 text-left">
                <span className="text-[10px] tracking-widest uppercase font-bold text-brand-pink mb-2 block">
                  {col.count}
                </span>
                <h2 className="font-display text-3xl text-brand-offwhite group-hover:text-brand-pink transition-colors mb-3">
                  {col.name}
                </h2>
                <p className="font-sans text-xs text-brand-offwhite/75 leading-relaxed mb-6">
                  {col.description}
                </p>
                <span className="text-xs text-brand-offwhite/90 flex items-center gap-1 font-sans font-semibold uppercase tracking-wider">
                  Explore Collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>

      <footer className="bg-brand-sage-section text-brand-offwhite/80 py-12 text-xs text-center font-sans mt-24">
        &copy; {new Date().getFullYear()} Resham Chikankari. All Rights Reserved. Lucknow, India.
      </footer>
    </div>
  );
}
