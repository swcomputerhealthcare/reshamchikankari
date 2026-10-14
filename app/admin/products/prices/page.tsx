import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { getProducts, getCategories } from "@/lib/catalog";
import { getPromotionCampaignAction } from "@/actions/promotions";
import BulkPriceEditor from "@/components/admin/bulk-price-editor";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Bulk Price Management — Resham Admin",
};

export default async function AdminBulkPricesPage() {
  // 1. Authorize Admin
  await requireAdmin();

  // 2. Fetch all real database products
  const { products } = await getProducts({ limit: 1000, includeInactive: true });
  const categoriesList = await getCategories();

  // 3. Fetch active promotion settings
  const promoRes = await getPromotionCampaignAction();
  const campaignConfig = {
    isActive: promoRes.isActive ?? true,
    discountPercentage: promoRes.discountPercent ?? 20,
    campaignName: promoRes.name || "Navratri Sale",
  };

  return (
    <div className="pb-24 selection:bg-brand-pink/20">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-8">
        <Container className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/products"
                className="text-neutral-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Catalog</span>
              </Link>
              <span className="text-neutral-600">/</span>
              <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">
                Pricing Engine
              </span>
            </div>
            <h1 className="font-display text-3xl tracking-wide">
              Bulk Price & MRP Operations
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/promotions">
              <Button variant="outline" className="py-2 text-xs border-white/20 text-white hover:bg-white/10">
                Configure Campaigns
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      {/* Main Bulk Price Editor */}
      <Container>
        <BulkPriceEditor
          initialProducts={products}
          categories={categoriesList.map((c) => ({ id: c.id, name: c.name }))}
          campaignConfig={campaignConfig}
        />
      </Container>
    </div>
  );
}
