'use client';

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Settings as SettingsIcon,
  ExternalLink,
  LogOut,
  Menu,
  X
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
  ];

  function renderSidebarContent() {
    return (
      <div className="flex flex-col h-full bg-brand-black text-brand-offwhite border-r border-white/10 font-sans selection:bg-brand-pink/20">
        {/* Branding */}
        <div className="py-6 px-6 border-b border-white/5">
          <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-white/20 p-1 bg-white/5 flex items-center justify-center flex-shrink-0">
              <img src="/images/logo.png" alt="Resham Chikankari" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-display text-lg tracking-widest text-brand-pink block font-semibold">Resham</span>
              <span className="text-[9px] tracking-[0.22em] uppercase text-neutral-400 font-semibold block">
                Atelier Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto scrollbar-custom">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 text-sm uppercase tracking-widest font-semibold transition-colors duration-150 rounded-xs ${
                  isActive
                    ? "bg-brand-sage text-white shadow-xs"
                    : "text-neutral-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-4">
          {/* View Storefront Link */}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-widest font-bold text-neutral-300 hover:text-white transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Storefront</span>
          </Link>

          {/* Profile Info */}
          <div className="flex items-center gap-3 px-3 py-1">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-brand-sage flex items-center justify-center font-bold text-sm border border-white/10">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate max-w-[140px] text-white">{user.name}</div>
              <div className="text-xs text-neutral-400 truncate max-w-[140px]">{user.email}</div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-50 cursor-pointer rounded-xs"
          >
            <LogOut className="h-4 w-4" />
            <span>{isPending ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <div className="hidden lg:block w-64 h-screen fixed top-0 left-0 flex-shrink-0 z-30">
        {renderSidebarContent()}
      </div>

      {/* Mobile Sticky Top Header */}
      <div className="lg:hidden h-16 w-full bg-brand-black text-brand-offwhite flex items-center justify-between px-6 border-b border-white/10 fixed top-0 left-0 z-40 selection:bg-brand-pink/20">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="Resham Chikankari" className="h-7 w-7 object-contain" />
          <span className="font-display text-lg tracking-widest text-brand-pink font-semibold">Resham Admin</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-neutral-400 hover:text-white p-1"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-64 max-w-xs h-full flex flex-col pt-16 z-10 transition-transform">
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
}
