import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import { db } from "@/db";
import { seoSettings, pageSeo } from "@/db/schema/content";
import { eq } from "drizzle-orm";
import SeoSettingsForm from "@/components/admin/seo-settings-form";

export const metadata = {
  title: "Admin SEO Management — Resham",
};

export default async function AdminSeoPage() {
  // Enforce ADMIN role check
  await requireAdmin();

  let globalSeo = null;
  let pagesSeoList: any[] = [];

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      // 1. Fetch global SEO settings row
      const globalRes = await db.query.seoSettings.findFirst({
        where: eq(seoSettings.id, "global"),
      });
      globalSeo = globalRes || null;

      // 2. Fetch page-specific SEO rows
      pagesSeoList = await db.query.pageSeo.findMany();
    } catch (e) {
      console.error("Failed to query database SEO parameters:", e);
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
            SEO & Metadata configuration
          </h1>
        </Container>
      </div>

      {/* Main SEO forms */}
      <Container>
        <SeoSettingsForm globalSeo={globalSeo} pagesSeo={pagesSeoList} />
      </Container>
    </div>
  );
}
