import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import ProductEditForm from "@/components/admin/product-edit-form";
import { getCategories, MOCK_PRODUCTS } from "@/lib/catalog";
import { db } from "@/db";
import { products } from "@/db/schema/catalog";
import { eq } from "drizzle-orm";

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: "Edit Product — Resham Admin",
};

export default async function AdminEditProductPage(props: AdminEditProductPageProps) {
  // Check authorization
  await requireAdmin();

  const params = await props.params;
  const id = params.id;

  const categoriesData = await getCategories();

  let product: any = null;
  const hasDb = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (hasDb) {
    try {
      product = await db.query.products.findFirst({
        where: eq(products.id, id),
        with: {
          images: true,
          variants: true,
        }
      });
    } catch (e) {
      console.error("Database product query failed:", e);
    }
  }

  if (!product) {
    const mock = MOCK_PRODUCTS.find((p) => p.id === id) || null;
    if (mock) {
      product = {
        ...mock,
        images: [],
        variants: [],
      };
    }
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-900 pb-24">
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
            Catalog Management
          </span>
          <h1 className="font-display text-3xl tracking-wide">
            Edit Product details
          </h1>
        </Container>
      </div>

      <Container className="max-w-3xl">
        <div className="bg-white border border-brand-black/5 p-8 sm:p-10 rounded-xs shadow-xs">
          <ProductEditForm product={product} categories={categoriesData} />
        </div>
      </Container>
    </div>
  );
}
