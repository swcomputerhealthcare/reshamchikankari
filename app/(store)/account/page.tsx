import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { requireUser } from "@/lib/auth/helpers";

export const metadata = {
  title: "My Account — Resham Chikankari",
  description: "Manage your profile, orders, and wishlist settings.",
};

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <>
      <div className="py-12 sm:py-16">

      {/* Profile Dashboard Card */}
      <Container className="max-w-4xl font-sans">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16">
          {/* Main Account details */}
          <div className="md:col-span-8 bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-brand-sage font-bold block mb-1">
                Customer Dashboard
              </span>
              <h1 className="font-display text-4xl text-brand-black">
                Namaste, {user.name}
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1">Email Address</h4>
                <p className="text-sm font-medium text-neutral-700">{user.email}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1">Account Role</h4>
                <p className="text-sm font-semibold text-brand-sage uppercase tracking-wider">{user.role}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1">Member Since</h4>
                <p className="text-sm font-medium text-neutral-700">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "Active Session"}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex items-center gap-4">
              {user.role === "ADMIN" && (
                <Link href="/admin/products">
                  <Button variant="secondary" className="py-2.5 px-5 text-xs font-bold tracking-widest uppercase">
                    Admin Panel
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links Menu */}
          <div className="md:col-span-4 bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs h-fit space-y-6">
            <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold border-b border-neutral-100 pb-3">
              Account Menu
            </h3>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-neutral-600">
              <li>
                <Link href="/account/wishlist" className="hover:text-brand-pink transition-colors block">
                  My Wishlist &hearts;
                </Link>
              </li>
              <li>
                <Link href="/account/wallet" className="hover:text-brand-pink transition-colors block">
                  My Wallet
                </Link>
              </li>
              <li>
                <span className="text-neutral-300 block select-none">
                  Order History (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-neutral-300 block select-none">
                  Addresses (Coming Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Container>
      </div>
    </>
  );
}
