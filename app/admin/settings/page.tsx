import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import { db } from "@/db";
import { siteSettings } from "@/db/schema/content";
import { eq } from "drizzle-orm";
import SiteSettingsForm from "@/components/admin/site-settings-form";

export const metadata = {
  title: "Admin Store Settings — Resham",
};

export default async function AdminSettingsPage() {
  // Enforce ADMIN role check
  await requireAdmin();

  let settings = null;
  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      const res = await db.query.siteSettings.findFirst({
        where: eq(siteSettings.id, "global"),
      });
      settings = res || null;
    } catch (e) {
      console.error("Failed to query database store configurations:", e);
    }
  }

  return (
    <div className="pb-24 selection:bg-brand-pink/20">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
            Management Portal
          </span>
          <h1 className="font-display text-3xl tracking-wide">
            Storefront configurations
          </h1>
        </Container>
      </div>

      {/* Main settings form */}
      <Container>
        <SiteSettingsForm settings={settings} />
      </Container>
    </div>
  );
}
