import React from "react";
import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { getCategories } from "@/lib/catalog";
import CategoryForm from "@/components/admin/category-form";

export const metadata = {
  title: "Admin Categories Dashboard — Resham",
};

export default async function AdminCategoriesPage() {
  // Check auth
  await requireAdmin();

  const categoriesList = await getCategories();

  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-900 font-sans pb-24 selection:bg-brand-pink/20">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
              Management Portal
            </span>
            <h1 className="font-display text-3xl tracking-wide">
              Category Settings
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white py-2 text-xs">
                Back to Products
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Categories directory */}
          <div className="lg:col-span-8 bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs h-fit">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">
              Active Categories ({categoriesList.length})
            </h2>

            {categoriesList.length === 0 ? (
              <div className="text-center py-20 text-neutral-500 text-sm">
                No categories found. Create one on the right panel.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {categoriesList.map((cat) => (
                  <div key={cat.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <div className="w-12 h-12 bg-neutral-50 border border-neutral-100 flex-shrink-0 relative overflow-hidden">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] text-neutral-300 flex items-center justify-center h-full">N/A</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-brand-black text-sm">{cat.name}</div>
                      <div className="text-[10px] text-neutral-400 font-sans mb-1">{cat.slug}</div>
                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {cat.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Category Sidebar */}
          <div className="lg:col-span-4 bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs h-fit">
            <CategoryForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
