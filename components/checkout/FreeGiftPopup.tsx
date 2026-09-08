'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, X, CheckCircle2, Heart } from "lucide-react";

interface FreeGiftPopupProps {
  onClaim?: () => void;
}

export default function FreeGiftPopup({ onClaim }: FreeGiftPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only display once per checkout session
    const hasSeenPopup = sessionStorage.getItem("rc_checkout_gift_popup_seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("rc_checkout_gift_popup_seen", "true");
      }, 700);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (onClaim) onClaim();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-brand-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Complimentary Gift Unlocked"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-[#FFF9F4] border border-[#ECE9E2] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-center font-sans overflow-hidden"
          >
            {/* Delicate Rosette Background Blur */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#E694AA]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#7C7A5A]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close gift popup"
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-brand-black hover:bg-black/5 transition-colors cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E694AA]/15 border border-[#E694AA]/30 text-[#B66F79] text-[9.5px] font-bold uppercase tracking-[0.24em] mb-4">
              <Sparkles className="w-3 h-3 text-[#E694AA]" />
              <span>COMPLIMENTARY PATRON PRIVILEGE</span>
            </div>

            {/* Glowing Gift Icon Animated Circle */}
            <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, -6, 6, -3, 3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C7A5A] to-[#605e43] text-white flex items-center justify-center shadow-lg shadow-[#7C7A5A]/25"
              >
                <Gift className="w-8 h-8 text-[#FFF9F4]" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-[#E694AA]/40 pointer-events-none"
              />
            </div>

            {/* Modal Heading & Description */}
            <h2 className="font-display text-2xl sm:text-3xl text-brand-black tracking-tight mb-2">
              Free Gift Added!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xs mx-auto mb-5">
              As our thank you for choosing authentic Chikankari, a complimentary free gift has been added to your order summary at zero cost.
            </p>

            {/* Gift Preview Box */}
            <div className="bg-[#F8F2EC] border border-[#ECE9E2] rounded-2xl p-3.5 sm:p-4 text-left flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#ECE9E2] flex items-center justify-center text-[#7C7A5A] shrink-0">
                <Gift className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-brand-black truncate">
                    Free Gift on Every Order
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Artisan crafted keepsake & token of appreciation
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-neutral-400 line-through">₹499</span>
                  <span className="text-[10px] font-bold text-[#7C7A5A] uppercase tracking-wider">
                    FREE (₹0)
                  </span>
                  <span className="text-[9px] bg-[#7C7A5A]/15 text-[#7C7A5A] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                    Included
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="space-y-2">
              <button
                onClick={handleClose}
                className="w-full py-3.5 px-6 bg-[#7C7A5A] hover:bg-brand-black text-[#FFF9F4] text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:scale-101 border-none flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFF9F4]" />
                <span>Claim Free Gift & Continue</span>
              </button>

              <p className="text-[10px] text-neutral-400 font-sans flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-[#E694AA] fill-[#E694AA]" />
                Handcrafted with love by Awadh artisans
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
