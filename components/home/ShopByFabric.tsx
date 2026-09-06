import React from "react";
import Container from "@/components/ui/container";
import ScrollReveal from "@/components/performance/ScrollReveal";
import FabricCard from "@/components/home/FabricCard";

const FABRICS = [
  {
    number: "01",
    name: "COTTON",
    descriptor: "STRUCTURED · BREATHABLE · PURE",
    ctaText: "EXPLORE COTTON",
    image: "/images/Cotton.jpeg",
    href: "/shop?fabric=cotton",
  },
  {
    number: "02",
    name: "RAYON",
    descriptor: "SILKY DRAPE · AIRY · EFFORTLESS",
    ctaText: "EXPLORE RAYON",
    image: "/images/Rayon.jpeg",
    href: "/shop?fabric=rayon",
  },
  {
    number: "03",
    name: "VISCOSE",
    descriptor: "FLUID · REGAL · GEORGETTE",
    ctaText: "EXPLORE VISCOSE",
    image: "/images/Viscose.jpeg",
    href: "/shop?fabric=viscose",
  },
  {
    number: "04",
    name: "CHANDERI",
    descriptor: "HERITAGE WEAVE · SHEER · LUSTROUS",
    ctaText: "EXPLORE CHANDERI",
    image: "/images/Chanderi.jpeg",
    href: "/shop?fabric=chanderi",
  },
  {
    number: "05",
    name: "MODAL",
    descriptor: "FEATHERLIGHT · SMOOTH · EVERYDAY",
    ctaText: "EXPLORE MODAL",
    image: "/images/Modal.jpeg",
    href: "/shop?fabric=modal",
  },
  {
    number: "06",
    name: "MUSLIN",
    descriptor: "TIMELESS WEAVE · GAUZY · SOFT",
    ctaText: "EXPLORE MUSLIN",
    image: "/images/Muslin.jpeg",
    href: "/shop?fabric=muslin",
  },
];

export default function ShopByFabric() {
  return (
    <section
      id="fabrics"
      className="relative z-10 w-full flex flex-col justify-center py-16 sm:py-24 lg:py-28 bg-[#F8F2EC] text-[#161616] border-t border-[#ECE9E2] overflow-hidden select-none"
    >
      <Container>
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div className="mb-12 sm:mb-16 lg:mb-20 text-left max-w-xl">
            <span className="text-[10px] sm:text-xs tracking-[0.25em] font-sans uppercase font-bold text-[#E694AA] mb-3 block">
              THE TEXTURES OF THE CRAFT
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#161616] leading-tight">
              Shop by Fabric
            </h2>
            <div className="w-16 h-[1px] bg-[#ECE9E2] my-4" />
            <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Discover the character of each hand-embroidered textile, carefully chosen for movement, breathability, and Awadh grace.
            </p>
          </div>
        </ScrollReveal>

        {/* 6-Fabric Luxury Editorial Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-x-10 lg:gap-y-14">
          {FABRICS.map((fabric, idx) => (
            <ScrollReveal
              key={fabric.name}
              direction="up"
              delay={idx * 0.08}
            >
              <FabricCard {...fabric} />
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
