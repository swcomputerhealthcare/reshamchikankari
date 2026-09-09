"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: { id: string; url: string; alt?: string | null }[];
  initialIndex?: number;
}

export default function ImageZoomModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageZoomModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(1.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch pinch tracking
  const touchStartDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1.8);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomScale(1.8);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoomScale(1.8);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoomScale(1.8);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Mouse wheel scroll zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.3 : -0.3;
    setZoomScale((prev) => {
      const nextScale = Math.min(Math.max(1, prev + zoomFactor), 4.5);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };

  // Touch pinch zoom handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      initialScaleRef.current = zoomScale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDistRef.current;
      const newScale = Math.min(Math.max(1, initialScaleRef.current * factor), 4.5);
      setZoomScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  if (!isOpen || !images || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];

  const handleImageClick = () => {
    if (isDragging) return;
    setZoomScale((prev) => {
      if (prev <= 1.2) return 2.2;
      if (prev <= 2.5) return 3.8;
      setPosition({ x: 0, y: 0 });
      return 1;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md select-none font-sans text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Product Image Lightbox"
      >
        {/* Simple Top Bar - Only Back Button and Close Button, NO UI MENU */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
          {/* Back Arrow Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 bg-black/75 hover:bg-black text-white rounded-full border border-white/20 backdrop-blur-md shadow-lg pointer-events-auto transition-all active:scale-95 cursor-pointer"
            aria-label="Back to product"
            title="Back to product"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5] text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-3 bg-black/75 hover:bg-black text-white rounded-full border border-white/20 backdrop-blur-md shadow-lg pointer-events-auto transition-all active:scale-95 cursor-pointer"
            aria-label="Close viewer"
            title="Close viewer (Esc)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Image Display Container with Scroll & Touch Pinch Zoom */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          {/* Side Arrows for Switching Gallery Photos */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white cursor-pointer transition-all shadow-lg active:scale-95"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6 stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white cursor-pointer transition-all shadow-lg active:scale-95"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </button>
            </>
          )}

          {/* Zoomable Image Container */}
          <motion.div
            key={currentImg.id || currentIndex}
            className="relative w-full h-full flex items-center justify-center"
            drag={zoomScale > 1}
            dragConstraints={containerRef}
            dragElastic={0.05}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
            style={{
              x: position.x,
              y: position.y,
            }}
          >
            <motion.div
              animate={{ scale: zoomScale }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={handleImageClick}
              className="relative w-full h-full max-w-[95vw] max-h-[85vh] flex items-center justify-center cursor-zoom-in"
            >
              <Image
                src={currentImg.url}
                alt={currentImg.alt || "Product image"}
                fill
                unoptimized
                priority
                className="object-contain pointer-events-none drop-shadow-2xl"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
