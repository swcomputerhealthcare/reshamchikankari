import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Target, Compass } from "lucide-react";

export const metadata = {
  title: "Our Story — Resham Chikankari",
  description: "Learn about our journey, family vision, mission, and commitment to preserving handcrafted Lucknowi Chikankari while empowering women artisans.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FFF9F4] text-[#1b1c19] min-h-screen font-sans selection:bg-[#7C7A5A] selection:text-[#FFF9F4]">
      <main className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 pt-8 pb-20 sm:pb-32 space-y-16 sm:space-y-24">
        {/* Header Hero Section */}
        <section className="text-center max-w-3xl mx-auto pt-6 sm:pt-10 space-y-4">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#E694AA] block">
            OUR HERITAGE & JOURNEY
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-[#7C7A5A] leading-tight">
            OUR STORY
          </h1>
          <div className="w-16 h-[1px] bg-[#7C7A5A]/20 mx-auto my-4" />
          <p className="font-sans text-sm sm:text-base text-[#69727D] max-w-xl mx-auto leading-relaxed">
            A shared family dream born in Lucknow, woven in thread, and dedicated to empowering local women artisans.
          </p>
        </section>

        {/* Section 1: The Founder's Family Journey */}
        <section className="flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-16 pt-2">
          {/* Left Campaign Image: Founders Portrait */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[560px] aspect-[1122/1402] overflow-hidden rounded-2xl border border-[#ECE9E2] shadow-md bg-[#F8F2EC]">
              <Image
                src="/images/about.png"
                alt="Resham Chikankari Founders — A Shared Family Dream"
                fill
                priority
                className="object-contain object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Right Personal Narrative */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-5 text-left md:pl-4">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#E694AA]">
              A SHARED DREAM
            </span>

            <div className="relative pl-5 sm:pl-6 border-l-2 border-[#E694AA]/60 space-y-4">
              <p className="font-sans text-sm sm:text-base text-[#2c3028] leading-relaxed">
                What began as a simple idea soon became a shared dream. Our journey started with my father-in-law’s vision—to bring the timeless beauty of handcrafted Chikankari to more people while preserving the artistry behind every stitch. As I became part of the family, I also became part of this dream, adding my own passion and perspective to help it grow.
              </p>
              <p className="font-sans text-sm sm:text-base text-[#2c3028] leading-relaxed">
                Together, we built more than a clothing brand. We built a promise—to celebrate India’s rich craftsmanship and support the talented local artisans whose skilled hands keep this beautiful tradition alive.
              </p>
              <p className="font-sans text-sm sm:text-base text-[#2c3028] leading-relaxed">
                Every kurti we create is thoughtfully chosen, blending comfort, elegance, and authentic craftsmanship. Behind every thread is a story of dedication, heritage, and countless hours of skilled work.
              </p>
              <p className="font-sans text-sm sm:text-base text-[#2c3028] leading-relaxed font-medium">
                When you choose us, you’re not just wearing Chikankari. You’re helping preserve a timeless craft, empowering artisan families, and becoming part of our journey.
              </p>
            </div>

            <div className="pt-3 border-t border-[#ECE9E2] w-full mt-2">
              <p className="font-sans text-xs sm:text-sm text-[#69727D] italic">
                Thank you for supporting handcrafted elegance
              </p>
              <p className="font-display text-lg sm:text-xl text-[#7C7A5A] font-semibold mt-1">
                — Resham Chikankari
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Mission & Vision Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 pt-6">
          {/* Our Mission */}
          <div className="p-8 sm:p-12 bg-[#F8F2EC] rounded-3xl border border-[#ECE9E2] flex flex-col justify-between space-y-6 text-left shadow-xs">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C7A5A]/10 text-[#7C7A5A] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                <Target className="w-3.5 h-3.5 text-[#E694AA]" />
                <span>Our Mission</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl text-[#7C7A5A] leading-snug">
                Preserving Craft & Empowering Artisans
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#69727D] leading-relaxed">
                At Resham Chikankari, our mission is to keep the timeless art of Chikankari alive by giving it the respect, recognition, and love it deserves. We are committed to supporting local artisans, especially talented women whose hands carry generations of skill and tradition.
              </p>
              <p className="font-sans text-sm sm:text-base text-[#69727D] leading-relaxed">
                With every piece we create, we hope to provide meaningful opportunities, celebrate their craftsmanship, and ensure that their beautiful art continues to be valued and passed on to future generations.
              </p>
            </div>
          </div>

          {/* Our Vision */}
          <div className="p-8 sm:p-12 bg-[#F8F2EC] rounded-3xl border border-[#ECE9E2] flex flex-col justify-between space-y-6 text-left shadow-xs">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C7A5A]/10 text-[#7C7A5A] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                <Compass className="w-3.5 h-3.5 text-[#E694AA]" />
                <span>Our Vision</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl text-[#7C7A5A] leading-snug">
                Creating a Legacy Rooted in Purpose
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#69727D] leading-relaxed">
                Our vision is to build more than just a clothing brand — we aspire to create a legacy rooted in tradition, empowerment, and purpose.
              </p>
              <p className="font-sans text-sm sm:text-base text-[#69727D] leading-relaxed">
                We dream of seeing Chikankari flourish for generations to come, while creating a platform where local artisans, especially women, can grow, thrive, and take pride in their craft.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Artisan & Craft Banner with CTA */}
        <section className="flex flex-col md:flex-row items-center gap-10 lg:gap-16 p-8 sm:p-14 bg-[#7C7A5A] text-[#FFF9F4] rounded-3xl shadow-xl text-left">
          {/* Left Text */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-6 md:pr-6">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E694AA]">
              WEAR THE LEGACY
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#FFF9F4] leading-tight">
              Thoughtfully Chosen. Authentically Crafted.
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#FFF9F4]/85 max-w-lg leading-relaxed">
              Explore our hand-embroidered Lucknowi Chikankari collection designed with quiet elegance and comfort for every occasion.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-2 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#FFF9F4] pb-1 border-b border-[#E694AA] hover:text-[#E694AA] transition-colors group"
            >
              Explore Our Collection <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] max-h-[500px] relative overflow-hidden rounded-2xl border border-[#FFF9F4]/20 shadow-md">
            <Image
              src="/images/reshamchikankari/New%20folder/IMG_2685.JPG"
              alt="Resham Chikankari Artisan Craft Collection"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
