'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import TextAnimation from "@/components/ui/scroll-text";
import ScrollReveal from "@/components/performance/ScrollReveal";

export default function CraftStory() {
  return (
    <section id="craft" className="relative z-30 w-full py-16 sm:py-24 lg:py-32 bg-[#F8F2EC] text-[#161616] border-t border-[#ECE9E2] overflow-visible">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: 2 Authentic Photos (lg:col-span-3) */}
          <ScrollReveal direction="left" className="lg:col-span-3 order-2 lg:order-1">
            <div className="flex flex-col gap-6 sm:gap-8">
              {/* Image 1 (Top Left) */}
              <div className="relative aspect-[3/4] w-full bg-[#FFF9F4] border border-[#ECE9E2] p-2 rounded-xl shadow-xs overflow-hidden group">
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                  <Image
                    src="/images/reshamchikankari/New%20folder%205/IMG_3230.JPG"
                    alt="Authentic handcrafted Lucknawi Chikankari garment detail"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>

              {/* Image 2 (Bottom Left) */}
              <div className="relative aspect-[3/4] w-full bg-[#FFF9F4] border border-[#ECE9E2] p-2 rounded-xl shadow-xs overflow-hidden lg:translate-x-2 group">
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                  <Image
                    src="/images/reshamchikankari/New%20folder%206/IMG_3115.JPG"
                    alt="Intricate shadow work embroidery detail"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Middle Column: Centered Editorial Text Narrative & CTA Button (lg:col-span-6) */}
          <ScrollReveal direction="up" className="lg:col-span-6 order-1 lg:order-2 text-center py-4">
            <div className="space-y-6 max-w-xl mx-auto flex flex-col items-center">
              <div>
                <span className="text-[10px] font-sans font-bold tracking-[0.25em] text-[#E694AA] uppercase block mb-3">
                  THE HERITAGE & ATELIER
                </span>
                <TextAnimation
                  text="Stitch by Stitch,&#10;A Story Written&#10;by Hand."
                  as="h2"
                  lineAnime={true}
                  classname="font-display text-4xl sm:text-5xl lg:text-6xl text-brand-black leading-[1.12] tracking-tight block text-center"
                  variants={{
                    hidden: { filter: "blur(8px)", opacity: 0, y: 24 },
                    visible: {
                      filter: "blur(0px)",
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
                    },
                  }}
                />
              </div>

              <div className="w-16 h-[1px] bg-brand-sage/30 my-2" />

              <TextAnimation
                text="Every motif in our collection is painstakingly embroidered by master women artisans in Lucknow, India. Using centuries-old shadow-work (Tepchi & Bakhiya), we merge cultural authenticity with modern silhouettes tailored for the contemporary woman."
                as="p"
                direction="up"
                classname="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md text-center block"
                variants={{
                  hidden: { filter: "blur(4px)", opacity: 0, y: 16 },
                  visible: {
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5 },
                  },
                }}
              />

              {/* Handcrafted Badges */}
              <div className="flex items-center justify-center gap-6 pt-2 font-sans text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E694AA]" />
                  <span>100% Handcrafted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7C7A5A]" />
                  <span>Lucknow Artisans</span>
                </div>
              </div>

              {/* Centered CTA Button */}
              <div className="pt-4">
                <Link href="/about">
                  <Button
                    variant="outline"
                    size="md"
                    className="!rounded-none border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-offwhite uppercase tracking-widest text-[10px] font-bold py-3.5 px-9 transition-colors cursor-pointer"
                  >
                    Explore Our Atelier
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: 2 Authentic Photos (lg:col-span-3) */}
          <ScrollReveal direction="right" className="lg:col-span-3 order-3">
            <div className="flex flex-col gap-6 sm:gap-8 lg:mt-6">
              {/* Image 3 (Top Right) */}
              <div className="relative aspect-[3/4] w-full bg-[#FFF9F4] border border-[#ECE9E2] p-2 rounded-xl shadow-xs overflow-hidden group">
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                  <Image
                    src="/images/reshamchikankari/New%20folder%203/IMG_3001.JPG"
                    alt="Classic Lucknawi Kurti silhouette"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>

              {/* Image 4 (Bottom Right) */}
              <div className="relative aspect-[3/4] w-full bg-[#FFF9F4] border border-[#ECE9E2] p-2 rounded-xl shadow-xs overflow-hidden lg:-translate-x-2 group">
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                  <Image
                    src="/images/reshamchikankari/New%20folder%2021/IMG_3192.JPG"
                    alt="Heritage embroidery detailing on Chikankari apparel"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </Container>
    </section>
  );
}
