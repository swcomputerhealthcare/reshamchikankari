'use client';

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";

export default function LogoutButton() {
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
    <Button
      variant="outline"
      onClick={handleLogout}
      isLoading={isPending}
      className="py-2.5 px-5 text-xs font-bold tracking-widest uppercase cursor-pointer"
    >
      Sign Out
    </Button>
  );
}
