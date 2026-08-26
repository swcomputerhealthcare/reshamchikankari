"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutLink() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      } catch (err) {
        console.error("Signout failed:", err);
      }
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="hover:text-brand-pink transition-colors duration-200 cursor-pointer disabled:opacity-50 text-[11px] uppercase tracking-widest font-medium font-sans border-none bg-transparent p-0"
    >
      {isPending ? "..." : "Logout"}
    </button>
  );
}
