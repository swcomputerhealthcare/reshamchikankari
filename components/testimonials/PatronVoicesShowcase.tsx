"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, CheckCircle2, Sparkles } from "lucide-react";

export interface PatronTestimonial {
  text: string;
  name: string;
  location: string;
  role?: string;
  garment: string;
  image: string;
  rating?: number;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: PatronTestimonial[];
  duration?: number;
}) => {
  return (
    <div className={`overflow-hidden ${props.className || ""}`}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 18,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, groupIdx) => (
            <React.Fragment key={groupIdx}>
              {props.testimonials.map((item, i) => (
                <div
                  key={`${groupIdx}-${i}`}
                  className="bg-[#F8F2EC] border border-[#ECE9E2] rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-[#E694AA]/40 transition-all duration-300 max-w-sm w-full text-left flex flex-col justify-between"
                >
                  {/* Star Rating & Garment Chip */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1 text-[#E2D89B]">
                        {Array.from({ length: item.rating || 5 }).map((_, starIdx) => (
                          <Star key={starIdx} className="w-3.5 h-3.5 fill-current stroke-none" />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-[#7C7A5A] uppercase tracking-wider bg-[#7C7A5A]/10 px-2.5 py-0.5 rounded-full truncate max-w-[170px]">
                        {item.garment}
                      </span>
                    </div>

                    {/* Testimonial Quote */}
                    <p className="font-sans text-xs sm:text-[13.5px] text-[#2c3028] leading-relaxed font-normal">
                      &ldquo;{item.text}&rdquo;
                    </p>
                  </div>

                  {/* Patron Profile Info */}
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#ECE9E2]/80">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#E694AA]/40 bg-[#FFF9F4] shadow-xs">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="44px"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-sans text-xs sm:text-sm font-bold text-[#161616] truncate">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#69727D] tracking-tight">
                        <span>{item.location}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 text-[#7C7A5A] font-medium">
                          <CheckCircle2 className="w-3 h-3 text-[#7C7A5A]" /> Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

const ALL_PATRONS: PatronTestimonial[] = [
  // Column 1
  {
    text: "The delicate precision of the shadow-work is unlike anything I've owned before. You can truly feel the human hands and centuries of Awadh history in every motif.",
    name: "Dr. Ananya Sharma",
    location: "New Delhi",
    garment: "RC Chanderi Sparkle Set",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    text: "Subtle, ethereal, and incredibly breathable in Mumbai's climate. Resham Chikankari captures quiet luxury in its truest, most authentic sense.",
    name: "Meera Sen",
    location: "Mumbai",
    garment: "RC Muslin Co-ord Set",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    text: "The pure cotton fabric is gossamer light yet remarkably structured. The Bakhiya and Phanda stitches around the neckline are pure poetry.",
    name: "Kavita Rao",
    location: "Bengaluru",
    garment: "RC Cotton Set",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    text: "The fit was exact and the hand embroidery has a tactile soul that machine work simply cannot replicate. Truly cherished.",
    name: "Pooja Deshmukh",
    location: "Pune",
    garment: "RC Dalby Straight Kurti",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },

  // Column 2
  {
    text: "Wore this for an intimate family celebration and received endless compliments. The drape of the viscose with the tonal Lucknowi jali work is magnificent.",
    name: "Ritu Singhania",
    location: "Kolkata",
    garment: "RC Viscose Rose MK Kurta",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    text: "As a Lucknow native who grew up with Chikankari, I can attest this is genuine heritage craft. Supporting these artisan women makes wearing it even more special.",
    name: "Sunita Varma",
    location: "Lucknow",
    garment: "RC MODAL Flower Kurta",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    text: "The packaging, the handwritten care note, and the sublime craft quality exceeded all expectations. My third purchase and certainly not my last.",
    name: "Ayesha Merchant",
    location: "Hyderabad",
    garment: "RC Phulkari Lehar Kurta",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    text: "Lightweight, airy, and so versatile. I pair it with palazzos for festive lunches and with denims for casual evenings.",
    name: "Nandini Nair",
    location: "Chennai",
    garment: "RC Chandni Short Kurti",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },

  // Column 3
  {
    text: "The white-on-white embroidery is pristine. Pure Awadh royalty in a modern, comfortable silhouette that feels weightless.",
    name: "Radhika Kulkarni",
    location: "Jaipur",
    garment: "RC Highlight Set White",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    text: "The contemporary cargo cut mixed with authentic Lucknowi stitches is such a fresh, brilliant design. Comfort meets timeless craft.",
    name: "Tanya Grover",
    location: "Gurugram",
    garment: "RC Cargo Set",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    text: "Every single stitch speaks of patience and dedication. So proud to wear authentic handcrafted Indian art made by women masters.",
    name: "Devika Joshi",
    location: "Ahmedabad",
    garment: "RC Rayon Kalini Kurti",
    image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    text: "The palazzos have the most graceful fall and delicate Chikankari borders. The mix-and-match versatility is unmatched.",
    name: "Shalini Mehra",
    location: "Chandigarh",
    garment: "RC Cotton Flare Palazzo",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
];

const firstColumn = ALL_PATRONS.slice(0, 4);
const secondColumn = ALL_PATRONS.slice(4, 8);
const thirdColumn = ALL_PATRONS.slice(8, 12);

export default function PatronVoicesShowcase() {
  return (
    <section className="relative my-8 sm:my-14 overflow-hidden select-none">
      {/* 3-Column Animated Testimonial Vertical Marquee with Smooth Fade Mask */}
      <div className="flex justify-center gap-6 sm:gap-8 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[760px] overflow-hidden">
        <TestimonialsColumn testimonials={firstColumn} duration={24} />
        <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={30} />
        <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={26} />
      </div>
    </section>
  );
}
