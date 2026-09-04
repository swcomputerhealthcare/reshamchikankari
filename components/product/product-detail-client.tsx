'use client';

import React, { useState, useMemo } from "react";
import ProductGallery from "@/components/product/product-gallery";
import ProductActionPanel from "@/components/product/product-action-panel";
import { type CatalogProduct } from "@/lib/catalog";

interface ProductDetailClientProps {
  product: CatalogProduct;
  initialWishlisted: boolean;
}

export default function ProductDetailClient({
  product,
  initialWishlisted,
}: ProductDetailClientProps) {
  // Determine if product has 2 or more distinct colors in its variants
  const distinctColors = useMemo(() => {
    const colors = new Set<string>();
    product.variants.forEach((v) => {
      if (v.colorName) colors.add(v.colorName);
    });
    return Array.from(colors);
  }, [product.variants]);

  const hasMultipleColors = distinctColors.length > 1;

  // Initialize selectedColor to first available color if multi-color, or null
  const [selectedColor, setSelectedColor] = useState<string | null>(() => {
    return hasMultipleColors ? distinctColors[0] : null;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16">
      {/* Gallery Column */}
      <div className="md:col-span-7">
        <ProductGallery
          images={product.images}
          selectedColor={selectedColor}
        />
      </div>

      {/* Actions Panel Column */}
      <div className="md:col-span-5 space-y-8">
        <div>
          <span className="text-[10px] sm:text-xs font-sans font-bold tracking-widest text-brand-sage uppercase mb-2 block">
            {product.category?.name || "Handcrafted Heritage"}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-black leading-tight mb-2">
            {product.name}
          </h1>
          <p className="text-xs text-neutral-500 font-sans tracking-wide">
            SKU: {product.sku}
          </p>
        </div>

        {/* Action Selector Component */}
        <ProductActionPanel
          product={product}
          variants={product.variants}
          initialWishlisted={initialWishlisted}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />

        {/* Product Info Accordion Details */}
        <div className="border-t border-brand-black/5 pt-8 space-y-6 font-sans">
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest text-brand-black font-bold">
              Description
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Product Specifications Grid */}
          {product.fabric && (
            <div className="space-y-3 border-t border-brand-black/5 pt-6">
              <h3 className="text-xs uppercase tracking-widest text-brand-black font-bold">
                Product Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs font-sans text-neutral-600">
                <div>
                  <span className="font-bold text-brand-black">Fabric:</span> {product.fabric}
                </div>
                <div>
                  <span className="font-bold text-brand-black">Color:</span> {selectedColor || product.color}
                </div>
                <div>
                  <span className="font-bold text-brand-black">Length:</span> {product.length}
                </div>
                <div>
                  <span className="font-bold text-brand-black">Neckline:</span> {product.neckline}
                </div>
                <div>
                  <span className="font-bold text-brand-black">Sleeves:</span> {product.sleeves}
                </div>
                <div>
                  <span className="font-bold text-brand-black">Occasion:</span> {product.occasion}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-bold text-brand-black">Wash Care:</span> {product.washCare}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 border-t border-brand-black/5 pt-6">
            <h3 className="text-xs uppercase tracking-widest text-brand-black font-bold">
              Garment details
            </h3>
            <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside">
              <li>100% handcrafted in Lucknow, India</li>
              <li>Traditional stitches: Bakhiya, Phanda, and Keel Kangan</li>
              <li>Authentic premium fabric selection</li>
              <li>Supports sustainable livelihood for women artisans</li>
            </ul>
          </div>

          <div className="space-y-2 border-t border-brand-black/5 pt-6">
            <h3 className="text-xs uppercase tracking-widest text-brand-black font-bold">
              Care instructions
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Chikankari hand embroidery is delicate. We recommend dry cleaning or gentle hand washing in cold water using a mild liquid detergent. Dry in shade and iron inside out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
