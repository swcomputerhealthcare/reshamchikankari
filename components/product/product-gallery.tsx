'use client';

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
  images: { id: string; url: string; alt?: string | null; colorName?: string | null }[];
  selectedColor?: string | null;
}

export default function ProductGallery({ images, selectedColor }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Filter images by selected color if provided and matching images exist
  const displayImages = React.useMemo(() => {
    if (!selectedColor) return images;
    const matching = images.filter((img) => img.colorName === selectedColor);
    return matching.length > 0 ? matching : images;
  }, [images, selectedColor]);

  // Reset activeIdx when selectedColor changes
  React.useEffect(() => {
    setActiveIdx(0);
  }, [selectedColor]);

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="relative w-full aspect-[3/4] bg-neutral-100 border border-brand-black/5 flex items-center justify-center text-xs text-neutral-400 font-sans rounded-none">
        No image available
      </div>
    );
  }

  const activeImage = displayImages[activeIdx] || displayImages[0];

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Active Main Image Container */}
      <div className="relative w-full aspect-[3/4] bg-white border border-brand-black/5 overflow-hidden group select-none rounded-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              const swipeThreshold = 40;
              if (info.offset.x < -swipeThreshold) {
                handleNext();
              } else if (info.offset.x > swipeThreshold) {
                handlePrev();
              }
            }}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt || "Product image"}
              fill
              priority
              className="object-contain bg-[#FFF9F4] pointer-events-none"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Arrow Navigation */}
        {displayImages.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-brand-black/5 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs z-10 sm:opacity-0 group-hover:opacity-100 duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-600" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-brand-black/5 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs z-10 sm:opacity-0 group-hover:opacity-100 duration-300"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-neutral-600" />
            </button>

            {/* Page Counter Indicator */}
            <div className="absolute bottom-4 right-4 bg-brand-black/85 text-brand-offwhite text-[9px] tracking-widest px-2.5 py-1 font-sans font-semibold uppercase">
              {activeIdx + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails list */}
      {displayImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto py-1">
          {displayImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={`relative w-16 h-20 border transition-all cursor-pointer flex-shrink-0 ${
                idx === activeIdx
                  ? "border-brand-black"
                  : "border-brand-black/10 hover:border-brand-black/35"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `Thumbnail ${idx + 1}`}
                fill
                className="object-contain bg-[#FFF9F4]"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
