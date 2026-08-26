import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-offwhite text-brand-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-sage border-t-transparent" />
        <span className="font-sans text-[10px] tracking-widest text-brand-sage uppercase font-medium animate-pulse">
          Loading Resham
        </span>
      </div>
    </div>
  );
}
