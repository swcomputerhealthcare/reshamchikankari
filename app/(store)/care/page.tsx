import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";

export const metadata = {
  title: "Garment Care Guide — Resham Chikankari",
  description: "Learn how to preserve and wash your delicate hand-embroidered Lucknowi Chikankari kurtis.",
};

export default function CarePage() {
  return (
    <div className="bg-brand-offwhite min-h-screen text-brand-black selection:bg-brand-pink/20 pb-24 pt-10">

      <Container className="max-w-2xl font-sans">
        <h1 className="font-display text-4xl text-brand-black mb-8 border-b border-brand-black/5 pb-4">
          Garment Care Guide
        </h1>
        
        <div className="space-y-8 text-sm text-neutral-600 leading-relaxed">
          <p>
            Chikankari is a delicate, hand-embroidered craft. Every stitch is completed by hand by women artisans in Lucknow. To keep your garments beautiful for years to come, we recommend the following instructions.
          </p>

          <div className="space-y-3">
            <h2 className="font-display text-xl text-brand-black">Washing Instructions</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Dry Clean Recommended:</strong> Especially for georgette, silk, and heavily embroidered cotton items.</li>
              <li><strong>Gentle Hand Wash:</strong> If hand washing cotton, use cold water and a mild, diluted detergent. Do not scrub or wring the embroidery.</li>
              <li><strong>Wash Separately:</strong> Wash dark colors separately, as natural dyes may bleed during initial washes.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl text-brand-black">Drying & Ironing</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Dry in Shade:</strong> Hang to dry in a cool, shaded area. Direct sunlight can fade delicate pastel hues.</li>
              <li><strong>Iron Inside Out:</strong> Always iron Chikankari garments on the reverse side to protect the hand-embroidered threads from snagging or flattening. Use a warm steam iron setting.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl text-brand-black">Storage</h2>
            <p>
              Store your garments in a cool, dry closet. Avoid hanging heavy georgette or silk Kurtas on plastic hangers as it may stretch the shoulders; fold them gently instead.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
