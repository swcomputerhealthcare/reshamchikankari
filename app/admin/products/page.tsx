import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { getProducts, getCategories } from "@/lib/catalog";
import ProductListController from "@/components/admin/product-list-controller";

export const metadata = {
  title: "Admin Products Dashboard — Resham",
};

export default async function AdminProductsPage() {
  // Enforce ADMIN role check server-side
  await requireAdmin();

  // Fetch data
  const { products } = await getProducts({ limit: 1000 });
  const categoriesList = await getCategories();

  return (
    <div className="pb-24 selection:bg-brand-pink/20">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
              Management Portal
            </span>
            <h1 className="font-display text-3xl tracking-wide">
              Catalog Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/categories">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white py-2 text-xs">
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/products/new">
              <Button variant="accent" className="py-2 text-xs">
                Add Product
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      {/* Main product catalogue list controller */}
      <Container>
        <ProductListController
          initialProducts={products}
          categories={categoriesList.map((c) => ({ id: c.id, name: c.name }))}
        />
      </Container>
    </div>
  );
}

