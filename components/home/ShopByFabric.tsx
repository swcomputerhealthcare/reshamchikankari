import React from "react";
import Image from "next/image";
import Container from "@/components/ui/container";
import ScrollReveal from "@/components/performance/ScrollReveal";
import FabricCard from "@/components/home/FabricCard";

const FABRICS = [
  {
    number: "01",
    name: "MODAL",
    descriptor: "LIGHT · FLUID · EVERYDAY",
    ctaText: "EXPLORE MODAL",
    image: "/images/reshamchikankari/New folder 5/IMG_3230.JPG",
    href: "/shop?fabric=modal",
    className: "lg:col-span-5 lg:col-start-1",
  },
  {
    number: "02",
    name: "MUSLIN",
    descriptor: "SOFT · AIRY · TIMELESS",
    ctaText: "EXPLORE MUSLIN",
    image: "/images/reshamchikankari/New folder/IMG_2685.JPG",
    href: "/shop?fabric=muslin",
    className: "lg:col-span-5 lg:col-start-7 lg:mt-20",
  },
  {
    number: "03",
    name: "VISCOSE",
    descriptor: "FLUID · FALLING · ELEGANT",
    ctaText: "EXPLORE VISCOSE",
    image: "/images/reshamchikankari/New folder 21/IMG_3192.JPG",
    href: "/shop?fabric=viscose",
    className: "lg:col-span-5 lg:col-start-1",
  },
  {
    number: "04",
    name: "COTTON",
    descriptor: "STRUCTURED · BREATHABLE · CLASSIC",
    ctaText: "EXPLORE COTTON",
    image: "/images/reshamchikankari/New folder 2/IMG_3250.JPG",
    href: "/shop?fabric=cotton",
    className: "lg:col-span-5 lg:col-start-7 lg:mt-10",
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

        {/* Asymmetric Swiss Editorial Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-x-14 lg:gap-y-16">
          {FABRICS.map((fabric, idx) => (
            <ScrollReveal
              key={fabric.name}
              direction="up"
              delay={idx * 0.1}
              className={fabric.className}
            >
              <FabricCard {...fabric} />
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
