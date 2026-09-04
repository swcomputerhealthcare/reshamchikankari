'use client';

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export interface TimelineEntry {
  title: string;
  subtitle: string;
  description: string;
  date: string;
  image?: string;
}

interface TimelineAnimationProps {
  entries: TimelineEntry[];
}

export default function TimelineAnimation({ entries }: TimelineAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 50%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto py-12 select-none">
      {/* Central Animated Vertical Progress Line */}
      <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-[2px] bg-[#161616]/15 -translate-x-1/2">
        <motion.div
          style={{ height: lineHeight }}
          className="w-full bg-[#E694AA] shadow-[0_0_12px_#E694AA]"
        />
      </div>

      {/* Timeline Entries */}
      <div className="space-y-16 sm:space-y-24">
        {entries.map((entry, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                isEven ? "sm:flex-row-reverse" : ""
              }`}
            >
              {/* Timeline Dot Node */}
              <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#F8F2EC] border-2 border-[#E694AA] flex items-center justify-center z-20 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#E694AA]" />
              </div>

              {/* Content Card (Left or Right Symmetrical Side) */}
              <div className={`w-full sm:w-1/2 pl-12 sm:pl-0 ${isEven ? "sm:pr-12 text-left" : "sm:pl-12 text-left"}`}>
                <div className="bg-[#F8F2EC] p-6 sm:p-8 rounded-[16px] border border-[#ECE9E2] shadow-sm space-y-3">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#E694AA] block">
                    {entry.date}
                  </span>

                  <h3 className="font-display text-2xl sm:text-3xl text-[#7C7A5A]">
                    {entry.title}
                  </h3>

                  <h4 className="font-sans text-xs uppercase tracking-widest text-[#161616]/80 font-bold">
                    {entry.subtitle}
                  </h4>

                  <p className="font-sans text-xs sm:text-sm text-[#161616]/75 leading-relaxed">
                    {entry.description}
                  </p>

                  {entry.image && (
                    <div className="relative aspect-[16/9] w-full rounded-[10px] overflow-hidden mt-4 border border-[#161616]/8">
                      <Image
                        src={entry.image}
                        alt={entry.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 400px"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Empty Spacer Side */}
              <div className="hidden sm:block sm:w-1/2" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
