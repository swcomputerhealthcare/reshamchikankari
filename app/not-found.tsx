import React from "react";
import Header from "@/components/layout/Header";
import NotFoundClient from "@/components/ui/not-found-client";

export default function NotFound() {
  return (
    <div className="bg-brand-sage-section min-h-screen flex flex-col w-full text-brand-offwhite selection:bg-brand-pink/20 relative overflow-x-hidden">
      {/* Editorial navbar adapting to sage-green backdrop */}
      <Header variant="dark" />

      {/* Main viewport centered composition */}
      <main className="flex-1 flex flex-col justify-center items-center py-12 relative w-full">
        <NotFoundClient />
      </main>
    </div>
  );
}
