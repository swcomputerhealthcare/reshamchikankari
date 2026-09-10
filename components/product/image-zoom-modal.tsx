"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

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
  const [zoomScale, setZoomScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [bounds, setBounds] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageBoxRef = useRef<HTMLDivElement>(null);

  // Touch pinch tracking
  const touchStartDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1.0);

  // Helper to recalculate drag bounds based on container vs scaled image size
  const updateBounds = useCallback((scale: number) => {
    if (!containerRef.current || !imageBoxRef.current) return { x: 0, y: 0 };

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageBoxRef.current.getBoundingClientRect();

    if (containerRect.width === 0 || containerRect.height === 0) return { x: 0, y: 0 };

    // Get current scale to calculate unscaled base dimensions
    const currentScale = scale || 1;
    const baseW = imageRect.width / (zoomScale || 1);
    const baseH = imageRect.height / (zoomScale || 1);

    const scaledW = baseW * currentScale;
    const scaledH = baseH * currentScale;

    const maxX = Math.max(0, (scaledW - containerRect.width) / 2);
    const maxY = Math.max(0, (scaledH - containerRect.height) / 2);

    const calculated = { x: maxX, y: maxY };
    setBounds(calculated);

    // Clamp motion values if current position exceeds new bounds
    if (Math.abs(x.get()) > maxX) {
      x.set(Math.sign(x.get() || 1) * maxX);
    }
    if (Math.abs(y.get()) > maxY) {
      y.set(Math.sign(y.get() || 1) * maxY);
    }

    return calculated;
  }, [zoomScale, x, y]);

  // Reset zoom & position when modal opens or index changes
  const resetZoom = useCallback(() => {
    setZoomScale(1.0);
    x.set(0);
    y.set(0);
    setBounds({ x: 0, y: 0 });
  }, [x, y]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      resetZoom();
    }
  }, [isOpen, initialIndex, resetZoom]);

  // Lock body scroll when modal is active
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

  // Update bounds whenever zoomScale, currentIndex, or window size changes
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => updateBounds(zoomScale);
    const timer = setTimeout(() => updateBounds(zoomScale), 50);

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, zoomScale, currentIndex, updateBounds]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetZoom();
  }, [images.length, resetZoom]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetZoom();
  }, [images.length, resetZoom]);

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

  // Mouse wheel scrolling & zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // Pinch or Ctrl + wheel zoom gesture
    if (e.ctrlKey) {
      const zoomFactor = -e.deltaY * 0.01;
      setZoomScale((prev) => {
        const nextScale = Math.min(Math.max(1, prev + zoomFactor), 4.5);
        if (nextScale === 1) {
          x.set(0);
          y.set(0);
        }
        updateBounds(nextScale);
        return nextScale;
      });
      return;
    }

    // If already zoomed in, mouse wheel vertical scroll pans along the Y axis
    if (zoomScale > 1) {
      const panSpeed = 1.2;
      const currentX = x.get();
      const currentY = y.get();

      const newX = currentX - e.deltaX * panSpeed;
      const newY = currentY - e.deltaY * panSpeed;

      x.set(Math.min(Math.max(-bounds.x, newX), bounds.x));
      y.set(Math.min(Math.max(-bounds.y, newY), bounds.y));
    } else {
      // If fit to screen, scrolling wheel up zooms in
      const zoomFactor = e.deltaY < 0 ? 0.3 : -0.3;
      setZoomScale((prev) => {
        const nextScale = Math.min(Math.max(1, prev + zoomFactor), 4.5);
        if (nextScale === 1) {
          x.set(0);
          y.set(0);
        }
        updateBounds(nextScale);
        return nextScale;
      });
    }
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
      if (newScale === 1) {
        x.set(0);
        y.set(0);
      }
      updateBounds(newScale);
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
      let nextScale = 1.0;
      if (prev <= 1.2) nextScale = 2.2;
      else if (prev <= 2.5) nextScale = 3.8;
      else nextScale = 1.0;

      if (nextScale === 1.0) {
        x.set(0);
        y.set(0);
      }
      updateBounds(nextScale);
      return nextScale;
    });
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => {
      const nextScale = Math.min(prev + 0.5, 4.5);
      updateBounds(nextScale);
      return nextScale;
    });
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const nextScale = Math.max(1.0, prev - 0.5);
      if (nextScale === 1.0) {
        x.set(0);
        y.set(0);
      }
      updateBounds(nextScale);
      return nextScale;
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
        {/* Top Header Bar */}
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

        {/* Main Image Display Container with Pan & Zoom */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          {/* Gallery Prev Arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white cursor-pointer transition-all shadow-lg active:scale-95"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>
          )}

          {/* Gallery Next Arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white cursor-pointer transition-all shadow-lg active:scale-95"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>
          )}

          {/* Zoomable & Pannable Image Element */}
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              key={currentImg.id || currentIndex}
              ref={imageBoxRef}
              drag={zoomScale > 1}
              dragConstraints={{
                left: -bounds.x,
                right: bounds.x,
                top: -bounds.y,
                bottom: bounds.y,
              }}
              dragElastic={0.05}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setTimeout(() => setIsDragging(false), 80)}
              style={{ x, y }}
              animate={{ scale: zoomScale }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={handleImageClick}
              className="relative w-full h-full max-w-[95vw] max-h-[85vh] flex items-center justify-center cursor-zoom-in select-none"
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
          </div>
        </div>

        {/* Floating Zoom Control Bar at Bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-black/75 border border-white/20 backdrop-blur-md rounded-full shadow-2xl pointer-events-auto">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomScale <= 1.0}
            className="p-2 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed text-white"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Zoom Scale Percentage Badge */}
          <span className="text-xs font-mono font-bold tracking-wider px-2 min-w-[50px] text-center text-amber-300">
            {Math.round(zoomScale * 100)}%
          </span>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomScale >= 4.5}
            className="p-2 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed text-white"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Reset Zoom Button */}
          {zoomScale > 1.0 && (
            <>
              <div className="w-[1px] h-4 bg-white/20 mx-1" />
              <button
                type="button"
                onClick={resetZoom}
                className="p-2 rounded-full hover:bg-white/20 transition-all active:scale-95 cursor-pointer text-white"
                title="Reset Zoom (100%)"
                aria-label="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
