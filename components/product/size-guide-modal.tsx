'use client';

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    pricePaise: number;
    image: string;
  };
}

const SIZE_CHART_DATA = [
  { size: "XXS", bust: 30, waist: 28, hip: 32, shoulder: 13.5 },
  { size: "XS", bust: 32, waist: 30, hip: 34, shoulder: 14.0 },
  { size: "S", bust: 34, waist: 32, hip: 36, shoulder: 14.5 },
  { size: "M", bust: 36, waist: 34, hip: 38, shoulder: 15.0 },
  { size: "L", bust: 38, waist: 36, hip: 40, shoulder: 15.5 },
  { size: "XL", bust: 40, waist: 38, hip: 42, shoulder: 16.0 },
  { size: "XXL", bust: 42, waist: 40, hip: 44, shoulder: 16.5 },
  { size: "3XL", bust: 44, waist: 42, hip: 46, shoulder: 17.0 },
  { size: "4XL", bust: 46, waist: 44, hip: 48, shoulder: 17.5 },
  { size: "5XL", bust: 48, waist: 46, hip: 50, shoulder: 18.0 },
  { size: "6XL", bust: 50, waist: 48, hip: 52, shoulder: 18.5 },
  { size: "7XL", bust: 52, waist: 50, hip: 54, shoulder: 19.0 }
];

export default function SizeGuideModal({ isOpen, onClose, product }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [activeTab, setActiveTab] = useState<"chart" | "measure">("chart");

  const formatVal = (val: number) => {
    if (unit === "in") return `${val}"`;
    return `${(val * 2.54).toFixed(1)} cm`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-brand-black/5 shadow-2xl rounded-lg z-10 flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-brand-black cursor-pointer select-none z-20"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Product details header card */}
            <div className="p-6 border-b border-brand-black/5 flex gap-4 items-center bg-white mt-10">
              <div className="relative w-16 h-20 bg-neutral-50 border border-brand-black/5 overflow-hidden flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain bg-white"
                  sizes="64px"
                />
              </div>
              <div className="font-sans">
                <span className="text-[9px] uppercase tracking-widest text-brand-sage font-bold block mb-1">
                  Resham Chikankari
                </span>
                <h2 className="text-sm font-semibold text-brand-black leading-snug line-clamp-1">
                  {product.name}
                </h2>
                <p className="text-xs font-semibold text-brand-pink mt-1">
                  ₹{(product.pricePaise / 100).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-brand-black/5 bg-white font-sans text-xs uppercase tracking-wider font-bold">
              <button
                onClick={() => setActiveTab("chart")}
                className={`flex-1 py-4 text-center border-b-2 transition-colors cursor-pointer ${
                  activeTab === "chart"
                    ? "border-brand-pink text-brand-pink"
                    : "border-transparent text-neutral-400 hover:text-brand-black"
                }`}
              >
                Size Chart
              </button>
              <button
                onClick={() => setActiveTab("measure")}
                className={`flex-1 py-4 text-center border-b-2 transition-colors cursor-pointer ${
                  activeTab === "measure"
                    ? "border-brand-pink text-brand-pink"
                    : "border-transparent text-neutral-400 hover:text-brand-black"
                }`}
              >
                How to Measure
              </button>
            </div>

            {/* Main Tabs Content */}
            <div className="p-6 flex-1 overflow-y-auto bg-brand-offwhite">
              {activeTab === "chart" ? (
                <div className="space-y-6">
                  {/* Unit Toggle */}
                  <div className="flex justify-end items-center gap-2 font-sans text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                    <span>Unit:</span>
                    <div className="flex border border-brand-black/10 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setUnit("in")}
                        className={`px-3 py-1 cursor-pointer transition-colors ${
                          unit === "in"
                            ? "bg-brand-black text-brand-offwhite"
                            : "hover:bg-neutral-50 text-neutral-400"
                        }`}
                      >
                        Inches
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnit("cm")}
                        className={`px-3 py-1 cursor-pointer transition-colors ${
                          unit === "cm"
                            ? "bg-brand-black text-brand-offwhite"
                            : "hover:bg-neutral-50 text-neutral-400"
                        }`}
                      >
                        CM
                      </button>
                    </div>
                  </div>

                  {/* Size Table */}
                  <div className="overflow-x-auto border border-brand-black/5 bg-white">
                    <table className="w-full text-left text-xs font-sans border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-brand-black/5 text-[9px] tracking-wider uppercase font-bold text-neutral-500">
                          <th className="p-3">Size</th>
                          <th className="p-3">Bust ({unit})</th>
                          <th className="p-3">Waist ({unit})</th>
                          <th className="p-3">Hip ({unit})</th>
                          <th className="p-3">Shoulder ({unit})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {SIZE_CHART_DATA.map((row) => (
                          <tr key={row.size} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="p-3 font-bold text-brand-black">{row.size}</td>
                            <td className="p-3 text-neutral-600">{formatVal(row.bust)}</td>
                            <td className="p-3 text-neutral-600">{formatVal(row.waist)}</td>
                            <td className="p-3 text-neutral-600">{formatVal(row.hip)}</td>
                            <td className="p-3 text-neutral-600">{formatVal(row.shoulder)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <span className="text-[10px] text-neutral-400 block italic font-sans text-center leading-normal">
                    * The measurements listed above represent actual body measurements. Standard garment fittings accommodate extra ease.
                  </span>
                </div>
              ) : (
                <div className="space-y-6 font-sans text-xs text-neutral-600 leading-relaxed uppercase tracking-wider">
                  <div className="bg-white border border-brand-black/5 p-5 space-y-4 rounded-lg">
                    <div>
                      <h4 className="font-bold text-brand-black mb-1">1. Bust</h4>
                      <p className="text-[10px] text-neutral-400">
                        Measure around the fullest part of your bust, keeping the measuring tape horizontal.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-black mb-1">2. Waist</h4>
                      <p className="text-[10px] text-neutral-400">
                        Measure around your natural waistline, which is the narrowest part of your torso.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-black mb-1">3. Hip</h4>
                      <p className="text-[10px] text-neutral-400">
                        Stand with your heels together and measure around the fullest part of your hips.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-black mb-1">4. Shoulder Width</h4>
                      <p className="text-[10px] text-neutral-400">
                        Measure from the outer edge of one shoulder bone straight across the back to the other shoulder bone edge.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions footer */}
            <div className="p-6 border-t border-brand-black/5 bg-white flex gap-4">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-brand-black text-brand-offwhite text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors cursor-pointer text-center rounded-lg"
              >
                Close Size Chart
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
