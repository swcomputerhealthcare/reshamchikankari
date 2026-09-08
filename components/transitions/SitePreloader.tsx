'use client';

import React from "react";

export default function SitePreloader({ children }: { children: React.ReactNode }) {
  // Direct pass-through so SSR and client immediately paint without blocking FCP
  return <>{children}</>;
}

