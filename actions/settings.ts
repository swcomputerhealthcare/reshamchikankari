'use server';

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/helpers";
import { db } from "@/db";
import { seoSettings, pageSeo, siteSettings } from "@/db/schema/content";
import { eq } from "drizzle-orm";

const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

// 1. GLOBAL SEO SETTINGS
export async function updateSeoSettingsAction(data: {
  siteTitle: string;
  metaDescription: string;
  defaultOgImage?: string | null;
  canonical?: string | null;
}) {
  await requireAdmin();
  if (!hasDatabase()) return { success: true };

  try {
    // Upsert equivalent for global row
    const existing = await db.query.seoSettings.findFirst({
      where: eq(seoSettings.id, "global"),
    });

    if (existing) {
      await db
        .update(seoSettings)
        .set({
          siteTitle: data.siteTitle,
          metaDescription: data.metaDescription,
          defaultOgImage: data.defaultOgImage || null,
          canonical: data.canonical || null,
          updatedAt: new Date(),
        })
        .where(eq(seoSettings.id, "global"));
    } else {
      await db.insert(seoSettings).values({
        id: "global",
        siteTitle: data.siteTitle,
        metaDescription: data.metaDescription,
        defaultOgImage: data.defaultOgImage || null,
        canonical: data.canonical || null,
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/seo");
    return { success: true };
  } catch (error: any) {
    console.error("Update global SEO failed:", error);
    return { success: false, error: "Failed to update SEO configurations." };
  }
}

// 2. PAGE SEO METADATA
export async function updatePageSeoAction(
  path: string,
  data: {
    title: string;
    description: string;
    canonicalUrl?: string | null;
    noIndex: boolean;
  }
) {
  await requireAdmin();
  if (!hasDatabase()) return { success: true };

  try {
    const existing = await db.query.pageSeo.findFirst({
      where: eq(pageSeo.path, path),
    });

    if (existing) {
      await db
        .update(pageSeo)
        .set({
          title: data.title,
          description: data.description,
          canonicalUrl: data.canonicalUrl || null,
          noIndex: data.noIndex,
          updatedAt: new Date(),
        })
        .where(eq(pageSeo.path, path));
    } else {
      const id = `seo_${Math.random().toString(36).substring(2, 11)}`;
      await db.insert(pageSeo).values({
        id,
        path,
        title: data.title,
        description: data.description,
        canonicalUrl: data.canonicalUrl || null,
        noIndex: data.noIndex,
      });
    }

    revalidatePath(path);
    revalidatePath("/admin/seo");
    return { success: true };
  } catch (error: any) {
    console.error("Update page SEO failed:", error);
    return { success: false, error: "Failed to update page metadata." };
  }
}

// 3. GLOBAL STORE SETTINGS & ANNOUNCEMENT BAR
export async function updateSiteSettingsAction(data: {
  storeName: string;
  storeEmail: string;
  supportPhone?: string | null;
  shippingThreshold: number;
  announcementBarText?: string | null;
  maintenanceMode: boolean;
}) {
  await requireAdmin();
  if (!hasDatabase()) return { success: true };

  try {
    const existing = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, "global"),
    });

    if (existing) {
      await db
        .update(siteSettings)
        .set({
          storeName: data.storeName,
          storeEmail: data.storeEmail,
          supportPhone: data.supportPhone || null,
          shippingThreshold: data.shippingThreshold,
          announcementBarText: data.announcementBarText || null,
          maintenanceMode: data.maintenanceMode,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, "global"));
    } else {
      await db.insert(siteSettings).values({
        id: "global",
        storeName: data.storeName,
        storeEmail: data.storeEmail,
        supportPhone: data.supportPhone || null,
        shippingThreshold: data.shippingThreshold,
        announcementBarText: data.announcementBarText || null,
        maintenanceMode: data.maintenanceMode,
      });
    }

    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    try {
      (revalidateTag as any)("site-settings");
    } catch {
      // Revalidation handled by revalidatePath
    }
    return { success: true };
  } catch (error: any) {
    console.error("Update site settings failed:", error);
    return { success: false, error: "Failed to update store settings." };
  }
}
