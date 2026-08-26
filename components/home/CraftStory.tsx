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
    <section id="craft" className="sticky top-0 z-30 w-full min-h-[100svh] flex flex-col justify-center py-24 sm:py-32 bg-[#FAF7F2] text-[#161616] rounded-t-3xl sm:rounded-t-[36px] shadow-2xl overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Text Narrative (col-span-5) — Sticky on Scroll */}
          <ScrollReveal direction="left" className="lg:col-span-5 relative z-20 lg:sticky lg:top-28 lg:self-start">
            <div className="space-y-8 text-left">
              <div>
                <span className="text-[10px] font-sans font-bold tracking-[0.25em] text-brand-sage uppercase block mb-3">
                  THE HERITAGE & ATELIER
                </span>
                <TextAnimation
                  text="Stitch by Stitch,&#10;A Story Written&#10;by Hand."
                  as="h2"
                  lineAnime={true}
                  classname="font-display text-4xl sm:text-5xl lg:text-6xl text-brand-black leading-[1.1] tracking-tight block"
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

              <div className="w-12 h-[1px] bg-brand-sage/60" />

              <TextAnimation
                text="Every motif in our collection is painstakingly embroidered by master women artisans in Lucknow, India. Using centuries-old shadow-work (Tepchi & Bakhiya), we merge cultural authenticity with modern silhouettes tailored for the contemporary woman."
                as="p"
                direction="up"
                classname="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md block"
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

              <div className="flex items-center gap-6 pt-2 font-sans text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
                  <span>100% Handcrafted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-sage" />
                  <span>Lucknow Artisans</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/about">
                  <Button
                    variant="outline"
                    size="md"
                    className="!rounded-none border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-offwhite uppercase tracking-widest text-[10px] font-bold py-3 px-8 transition-colors"
                  >
                    Explore Our Atelier
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Image Presentation (col-span-7) — Scrolling Gallery */}
          <ScrollReveal direction="right" className="lg:col-span-7 relative z-20 space-y-12">
            <div className="grid grid-cols-12 gap-6 items-center">
              {/* Primary Garment Presentation Shot */}
              <div className="col-span-7 sm:col-span-8 relative aspect-[3/4] bg-white border border-brand-black/5 rounded-xs p-3 shadow-xs">
                <div className="relative w-full h-full overflow-hidden bg-[#FBF7F2] rounded-2xs">
                  <Image
                    src="/images/reshamchikankari/New%20folder%205/IMG_3230.JPG"
                    alt="Authentic handcrafted Lucknawi Chikankari garment detail"
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 1024px) 70vw, 40vw"
                  />
                </div>
              </div>

              {/* Close-up Handwork Detail Shot */}
              <div className="col-span-5 sm:col-span-4 relative aspect-[3/4] bg-white border border-brand-black/5 mt-8 sm:mt-12 rounded-xs p-2.5 shadow-xs">
                <div className="relative w-full h-full overflow-hidden rounded-2xs">
                  <Image
                    src="/images/reshamchikankari/New%20folder%206/IMG_3115.JPG"
                    alt="Intricate shadow work embroidery detail"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 30vw, 20vw"
                  />
                </div>
              </div>
            </div>

            {/* Second Sticky Gallery Pair */}
            <div className="grid grid-cols-12 gap-6 items-center pt-6">
              <div className="col-span-5 sm:col-span-4 relative aspect-[3/4] bg-white border border-brand-black/5 rounded-xs p-2.5 shadow-xs">
                <div className="relative w-full h-full overflow-hidden rounded-2xs">
                  <Image
                    src="/images/reshamchikankari/New%20folder%202/IMG_3258.JPG"
                    alt="Tepchi Shadow Work Stitch Detail"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 30vw, 20vw"
                  />
                </div>
              </div>

              <div className="col-span-7 sm:col-span-8 relative aspect-[3/4] bg-white border border-brand-black/5 rounded-xs p-3 shadow-xs">
                <div className="relative w-full h-full overflow-hidden bg-[#FBF7F2] rounded-2xs">
                  <Image
                    src="/images/reshamchikankari/New%20folder%202/IMG_3273.JPG"
                    alt="Phanda & Murri Stitch Craftsmanship"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 70vw, 40vw"
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
