import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TimelineAnimation from "@/components/ui/timeline-animation";

export const metadata = {
  title: "The Art of Chikankari — About Resham Chikankari",
  description: "Explore the centuries-old tradition of hand-embroidery, Awadh heritage, and quiet luxury at Resham Chikankari.",
};

const CHIKANKARI_TIMELINE = [
  {
    date: "16TH CENTURY",
    title: "ROYAL COURTS OF AWADH",
    subtitle: "Patronage of Empress Noor Jahan",
    description: "Chikankari flourished under royal Awadh patronage, where delicate white-on-white shadow embroidery was crafted exclusively for nobility.",
    image: "/images/reshamchikankari/New%20folder%203/IMG_3001.JPG",
  },
  {
    date: "18TH CENTURY",
    title: "THE 32 SACRED STITCHES",
    subtitle: "Artisanal Mastery",
    description: "Master embroiderers codified over 32 distinct hand-stitches including Tepchi, Bakhiya, Phanda, and Murri, creating unparalleled textile poetry.",
    image: "/images/reshamchikankari/New%20folder/IMG_2685.JPG",
  },
  {
    date: "20TH CENTURY",
    title: "HERITAGE COLLECTIVES",
    subtitle: "Empowering Women Artisans",
    description: "Craftsmanship transitioned into grassroots women's artisan guilds across Lucknow, preserving ancestral heritage across generations.",
    image: "/images/reshamchikankari/New%20folder%2021/IMG_3192.JPG",
  },
  {
    date: "TODAY",
    title: "RESHAM CHIKANKARI",
    subtitle: "Quiet Luxury Reimagined",
    description: "Authentic hand-embroidered Lucknowi heirlooms designed for contemporary silhouettes while preserving century-old Awadh grace.",
    image: "/images/reshamchikankari/New%20folder%205/IMG_3230.JPG",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#FFF9F4] text-[#1b1c19] min-h-screen font-sans selection:bg-[#3F5031] selection:text-[#FFF9F4]">
      <main className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 pt-8 pb-20 sm:pb-32 space-y-20 sm:space-y-32">
        {/* Hero Section */}
        <section className="min-h-[550px] lg:min-h-[650px] flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-16 pt-6">
          {/* Left Text */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-6 text-left md:pr-6">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#E694AA]">
              OUR HERITAGE
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#3F5031] leading-tight">
              THE ART OF<br />CHIKANKARI
            </h1>
            <p className="font-sans text-base sm:text-lg text-[#44483f] max-w-xl leading-relaxed">
              A legacy woven in white thread. We explore the centuries-old tradition of hand-embroidery, bringing quiet luxury to modern silhouettes.
            </p>
            <div className="h-px w-24 bg-[#161616] mt-4" />
          </div>

          {/* Right Hero Image */}
          <div className="w-full md:w-1/2 h-[380px] sm:h-[500px] md:h-[600px] relative overflow-hidden rounded-2xl border border-[#161616]/10 shadow-xs">
            <Image
              src="/images/reshamchikankari/New%20folder%203/IMG_3001.JPG"
              alt="Master artisan embroidering Chikankari floral motifs on sheer fabric"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </section>

        {/* Scroll-Animated Timeline Section */}
        <section className="text-center py-8">
          <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#E694AA] mb-3 block">
              CHRONICLES OF AWADH
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-[#3F5031] leading-tight">
              The Evolution of Craft
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#44483f] mt-3 max-w-md mx-auto leading-relaxed">
              Trace the journey of Lucknowi hand-embroidery through centuries of royal patronage and artisan dedication.
            </p>
          </div>

          <TimelineAnimation entries={CHIKANKARI_TIMELINE} />
        </section>

        {/* Editorial Block 1: The Origin */}
        <section className="flex flex-col-reverse md:flex-row items-center gap-10 lg:gap-16 text-left">
          {/* Left Image */}
          <div className="w-full md:w-1/2 h-[380px] sm:h-[500px] md:h-[600px] relative overflow-hidden rounded-2xl border border-[#161616]/10 shadow-xs">
            <Image
              src="/images/reshamchikankari/New%20folder/IMG_2685.JPG"
              alt="Architectural silhouetted elegance of Lucknow at dawn"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Right Text */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-6 md:pl-6">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#E694AA]">
              01 / The Origin
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#3F5031]">
              A CITY&apos;S SOUL
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#44483f] max-w-lg leading-relaxed">
              Born in the royal courts of Awadh, Chikankari is more than an embellishment; it is the poetry of Lucknow captured in thread. Every stitch whispers tales of Nawabi elegance, a tradition passed down through generations of skilled artisans who continue to breathe life into pristine fabrics.
            </p>
          </div>
        </section>

        {/* Editorial Block 2: The Process */}
        <section className="flex flex-col md:flex-row items-center gap-10 lg:gap-16 p-8 sm:p-14 bg-[#efeee9]/70 rounded-3xl border border-[#161616]/10 text-left">
          {/* Left Text */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-6 md:pr-6">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#E694AA]">
              02 / The Process
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#3F5031]">
              METICULOUS PRECISION
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#44483f] max-w-lg leading-relaxed">
              True luxury requires time. Our process begins with the careful selection of sheer cotton and georgette, followed by the block-printing of intricate motifs. The true magic lies in the hands of the embroiderers, who employ over thirty distinct stitches to create patterns of breathtaking complexity and sublime subtlety.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-2 font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#161616] pb-1 border-b border-[#161616] hover:text-[#3F5031] hover:border-[#3F5031] transition-colors group"
            >
              Explore Artisanal Collection <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 h-[380px] sm:h-[500px] md:h-[600px] relative overflow-hidden rounded-2xl border border-[#161616]/10 shadow-xs">
            <Image
              src="/images/reshamchikankari/New%20folder%2021/IMG_3192.JPG"
              alt="Wooden printing blocks, cotton thread spools, and sheer Lucknowi textiles"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
