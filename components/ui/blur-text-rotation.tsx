'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SloganItem = 
  | { type: "simple"; text: string }
  | { type: "devanagari" };

const SLOGANS: SloganItem[] = [
  { type: "simple", text: "crafted by hand, luxury you can wear everyday" },
  { type: "simple", text: "refined looks, premium feel" },
  { type: "devanagari" },
  { type: "simple", text: "when the tradition meets luxury" }
];

export default function BlurTextRotation() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLOGANS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeSlogan = SLOGANS[index];

  return (
    <div className="min-h-[120px] sm:min-h-[180px] lg:min-h-[220px] flex items-center select-none w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, filter: "blur(12px)", y: 15 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          exit={{ opacity: 0, filter: "blur(8px)", y: -15 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-start text-left"
        >
          {activeSlogan.type === "simple" ? (
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-brand-black leading-tight tracking-wide font-normal max-w-xl">
              {activeSlogan.text}
            </h1>
          ) : (
            <div className="flex flex-col items-center leading-none py-1">
              <span className="font-display text-xs sm:text-sm font-bold tracking-[0.25em] text-brand-black uppercase mb-1">
                THE ART OF
              </span>
              <span className="font-display text-6xl sm:text-7xl lg:text-8xl text-brand-black leading-none">
                चिकनकारी
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
