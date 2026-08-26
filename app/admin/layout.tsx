import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce ADMIN role check server-side for all sub-routes
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F8F4EF] text-neutral-900 font-sans selection:bg-brand-pink/20 antialiased">
      {/* Sidebar navigation */}
      <AdminSidebar user={user} />

      {/* Main panel container */}
      <div className="lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
