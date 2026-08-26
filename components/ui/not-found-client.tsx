"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function NotFoundClient() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 relative z-10 w-full max-w-4xl mx-auto">
      {/* 404 Composition container with initial-load animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="w-full flex flex-col items-center text-center select-none"
      >
        {/* Large Typography Container */}
        <div className="relative font-display text-[clamp(140px,26vw,380px)] leading-none text-brand-pink tracking-tight flex items-center justify-center mb-6">
          <span>4</span>
          <span className="relative inline-flex items-center justify-center">
            {/* The 0 */}
            <span>0</span>
            {/* Delicately integrated Chikankari floral embroidery motif inside the 0 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg
                className="w-[0.45em] h-[0.45em] text-brand-offwhite pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Elegant curved vine */}
                <path
                  d="M50 82 C50 65, 38 52, 50 35 C55 30, 62 30, 66 35"
                  stroke="#FFF9F4"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeDasharray="2 3"
                  opacity="0.6"
                />
                {/* Secondary delicate vine */}
                <path
                  d="M48 62 C40 60, 36 50, 42 44"
                  stroke="#FFF9F4"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.4"
                />

                {/* Main central flower (embroidered Phanda/Murri stitch) */}
                <circle cx="50" cy="35" r="4.5" fill="#E694AA" stroke="#FFF9F4" strokeWidth="1.2" />
                <circle cx="50" cy="35" r="1.5" fill="#FFF9F4" />

                {/* Petals */}
                <path d="M50 35 C48 22, 52 22, 50 35 Z" fill="rgba(230, 148, 170, 0.25)" stroke="#FFF9F4" strokeWidth="0.8" />
                <path d="M50 35 C48 48, 52 48, 50 35 Z" fill="rgba(230, 148, 170, 0.25)" stroke="#FFF9F4" strokeWidth="0.8" />
                <path d="M50 35 C37 33, 37 37, 50 35 Z" fill="rgba(230, 148, 170, 0.25)" stroke="#FFF9F4" strokeWidth="0.8" />
                <path d="M50 35 C63 33, 63 37, 50 35 Z" fill="rgba(230, 148, 170, 0.25)" stroke="#FFF9F4" strokeWidth="0.8" />

                {/* Diagonal decorative leaves */}
                <path d="M42 44 C34 44, 35 38, 42 44 Z" fill="#3F5031" stroke="#FFF9F4" strokeWidth="0.8" />
                <path d="M58 52 C66 52, 65 46, 58 52 Z" fill="#3F5031" stroke="#FFF9F4" strokeWidth="0.8" />

                {/* Tiny embroidered French knot dots (Tepchi stitches) */}
                <circle cx="50" cy="18" r="1.2" fill="#E694AA" />
                <circle cx="50" cy="52" r="1.2" fill="#E694AA" />
                <circle cx="33" cy="35" r="1.2" fill="#E694AA" />
                <circle cx="67" cy="35" r="1.2" fill="#E694AA" />
              </svg>
            </motion.div>
          </span>
          <span>4</span>
        </div>

        {/* Typographic Hierarchy */}
        <h2 className="font-sans text-xs tracking-[0.18em] font-semibold text-brand-offwhite uppercase mb-4">
          Page Not Found
        </h2>

        <p className="font-sans text-sm sm:text-base text-brand-offwhite/70 max-w-md mx-auto leading-[1.7] mb-10 font-normal">
          The page you are looking for has wandered<br />beyond our collection.
        </p>

        {/* Back to Home Button */}
        <Link href="/" className="inline-block">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-12 px-9 bg-brand-offwhite text-brand-sage font-sans text-[11px] font-semibold uppercase tracking-[0.12em] border-none rounded-full cursor-pointer hover:bg-brand-pink hover:text-brand-black transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
          >
            Back to Home <span className="text-[12px] font-sans font-bold translate-y-[-0.5px]">→</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Very subtle background embroidery ornament detail */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none">
        <div className="relative w-[600px] h-[600px] flex items-center justify-center">
          {/* Dashed outer circle */}
          <svg className="absolute inset-0 w-full h-full text-brand-offwhite opacity-[0.06]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="50" cy="50" r="40" strokeDasharray="1 3" />
          </svg>
          
          {/* Lotus background image replacing the old path petals */}
          <div className="absolute w-[450px] h-[450px] opacity-[0.09] blur-[2.5px]">
            <Image
              src="/images/Lotus.png"
              alt="Lotus Motif"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
