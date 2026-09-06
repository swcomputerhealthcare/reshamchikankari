import React from "react";
import Image from "next/image";
import TransitionLink from "@/components/transitions/TransitionLink";

interface FabricCardProps {
  number: string;
  name: string;
  descriptor: string;
  ctaText: string;
  image: string;
  href: string;
  className?: string;
}

export default function FabricCard({
  number,
  name,
  descriptor,
  ctaText,
  image,
  href,
  className = "",
}: FabricCardProps) {
  return (
    <div className={`group flex flex-col space-y-4 text-left ${className}`}>
      {/* Top Header: Fabric Number & Name */}
      <div className="space-y-1">
        <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#E694AA] uppercase block">
          {number}
        </span>
        <h3 className="font-display text-2xl sm:text-3xl text-[#161616] tracking-wide group-hover:text-[#7C7A5A] transition-colors">
          {name}
        </h3>
      </div>

      {/* Editorial Image Frame */}
      <TransitionLink href={href} className="block relative aspect-[4/5] w-full overflow-hidden bg-[#F8F2EC] border border-[#ECE9E2] rounded-xl p-2 sm:p-2.5 shadow-xs">
        <div className="relative w-full h-full overflow-hidden rounded-lg bg-[#FFF9F4]">
          <Image
            src={image}
            alt={`${name} fabric Chikankari garment`}
            fill
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.035]"
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
          />
        </div>
      </TransitionLink>

      {/* Card Info Below Image */}
      <div className="space-y-2.5 pt-1">
        <p className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#69727D] uppercase">
          {descriptor}
        </p>

        {/* Text Interaction CTA */}
        <div>
          <TransitionLink
            href={href}
            className="inline-flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-[0.18em] text-[#7C7A5A] group/link cursor-pointer relative pb-1"
          >
            <span>{ctaText}</span>
            <span className="transition-transform duration-300 group-hover/link:translate-x-1.5">
              →
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#7C7A5A] transition-all duration-300 group-hover/link:w-full" />
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
