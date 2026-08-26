import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import ProductForm from "@/components/admin/product-form";
import { getCategories } from "@/lib/catalog";

export const metadata = {
  title: "Add Product — Resham Admin",
};

export default async function AdminNewProductPage() {
  // Check admin security authorization
  await requireAdmin();

  const categoriesData = await getCategories();

  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-900 pb-24">
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
            Catalog Management
          </span>
          <h1 className="font-display text-3xl tracking-wide">
            Add New Product
          </h1>
        </Container>
      </div>

      <Container className="max-w-3xl">
        <div className="bg-white border border-brand-black/5 p-8 sm:p-10 rounded-xs shadow-xs">
          <ProductForm categories={categoriesData} />
        </div>
      </Container>
    </div>
  );
}
