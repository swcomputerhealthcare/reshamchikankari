'use client';

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductToggle from "./product-toggle";
import { duplicateProductAction, deleteProductAction, deactivateProductAction } from "@/actions/catalog";
import { Search, ChevronLeft, ChevronRight, Copy, Archive, Trash2, Edit } from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  pricePaise: number;
  isActive: boolean;
  categoryId: string;
  images: { url: string }[];
}

interface CategoryItem {
  id: string;
  name: string;
}

interface ProductListControllerProps {
  initialProducts: ProductItem[];
  categories: CategoryItem[];
}

export default function ProductListController({
  initialProducts,
  categories,
}: ProductListControllerProps) {
  const [productsList, setProductsList] = useState<ProductItem[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isPending, startTransition] = useTransition();

  // Action status states
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Map category IDs to names for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Handle Search and Filter logic
  const filteredProducts = useMemo(() => {
    return productsList.filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(search.toLowerCase()) ||
        prod.sku.toLowerCase().includes(search.toLowerCase()) ||
        prod.slug.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || prod.categoryId === selectedCategory;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && prod.isActive) ||
        (statusFilter === "inactive" && !prod.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [productsList, search, selectedCategory, statusFilter]);

  // Paginated products
  const totalPages = Math.max(Math.ceil(filteredProducts.length / itemsPerPage), 1);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const showToast = (text: string, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleToggleStatus = (id: string, newActive: boolean) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: newActive } : p))
    );
    showToast(newActive ? "Product is now LIVE on storefront." : "Product is now HIDDEN from storefront.");
  };

  const handleDuplicate = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await duplicateProductAction(id);
      if (res.success) {
        showToast("Product duplicated successfully.");
        // Refresh catalog simulation by adding placeholder in state
        const dupedProduct = productsList.find((p) => p.id === id);
        if (dupedProduct) {
          setProductsList([
            {
              ...dupedProduct,
              id: res.id || `dup_${Date.now()}`,
              name: `${dupedProduct.name} (Copy)`,
              sku: `${dupedProduct.sku}-COPY`,
              slug: `${dupedProduct.slug}-copy`,
              isActive: false,
            },
            ...productsList,
          ]);
        }
      } else {
        showToast(res.error || "Failed to duplicate product.", true);
      }
    });
  };

  const handleArchive = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await deactivateProductAction(id, false);
      if (res.success) {
        showToast("Product archived successfully.");
        setProductsList(
          productsList.map((p) => (p.id === id ? { ...p, isActive: false } : p))
        );
      } else {
        showToast(res.error || "Failed to archive product.", true);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (res.success) {
        showToast("Product deleted permanently.");
        setProductsList(productsList.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
      } else {
        showToast(res.error || "Failed to delete product.", true);
        setDeleteConfirmId(null);
      }
    });
  };

  return (
    <div className="font-sans">
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 border text-xs font-bold uppercase tracking-widest transition-all rounded-xs shadow-md ${
            message.isError
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-brand-black border-white/10 text-brand-offwhite"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter and Search toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by Name, SKU, or Slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-brand-black/15 rounded-xs pl-10 pr-4 py-3 text-sm tracking-wide uppercase font-semibold text-brand-black focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-500">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-white border border-brand-black/15 rounded-xs px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-black focus:outline-none focus:border-brand-sage"
            >
              <option value="all">All Products</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-500">
              Category
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-brand-black/15 rounded-xs px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-black focus:outline-none focus:border-brand-sage"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table & Cards */}
      <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
        <h2 className="text-base font-bold uppercase tracking-wider text-brand-black mb-6">
          Products Directory ({filteredProducts.length})
        </h2>

        {paginatedProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-sm">
            No products match your filters.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-xs font-bold bg-neutral-50/50">
                    <th className="py-4 pr-4 pl-3">Product Details</th>
                    <th className="py-4 px-4">SKU</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 pl-4 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paginatedProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-4 pr-4 pl-3 flex items-center gap-3.5">
                        <div className="relative h-12 w-12 bg-neutral-50 border border-neutral-200 rounded-xs overflow-hidden flex-shrink-0">
                          {prod.images[0]?.url ? (
                            <Image
                              src={prod.images[0].url}
                              alt={prod.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-neutral-300 flex items-center justify-center h-full">N/A</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-brand-black text-sm">{prod.name}</div>
                          <div className="text-xs text-neutral-400 font-mono lowercase">{prod.slug}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-sans font-bold text-brand-black text-sm">
                        {prod.sku}
                      </td>
                      <td className="py-4 px-4 text-neutral-600 uppercase font-bold text-xs tracking-wider">
                        {categoryMap.get(prod.categoryId) || "Unassigned"}
                      </td>
                      <td className="py-4 px-4 font-bold text-brand-black text-sm">
                        ₹{(prod.pricePaise / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4">
                        <ProductToggle
                          id={prod.id}
                          initialActive={prod.isActive}
                          onToggle={(newActive) => handleToggleStatus(prod.id, newActive)}
                        />
                      </td>
                      <td className="py-4 pl-4 pr-3 text-right space-x-3">
                        <Link
                          href={`/admin/products/${prod.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:text-brand-black uppercase tracking-wider transition-colors py-1 px-1.5"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDuplicate(prod.id)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-black uppercase tracking-wider transition-colors cursor-pointer py-1 px-1.5"
                        >
                          <Copy className="h-4 w-4" />
                          <span>Duplicate</span>
                        </button>
                        <button
                          onClick={() => handleArchive(prod.id)}
                          disabled={isPending || !prod.isActive}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-black uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer py-1 px-1.5"
                        >
                          <Archive className="h-4 w-4" />
                          <span>Archive</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(prod.id)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors cursor-pointer py-1 px-1.5"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-4">
              {paginatedProducts.map((prod) => (
                <div key={prod.id} className="border border-neutral-100 p-4 rounded-xs flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 bg-neutral-50 border border-neutral-100 flex-shrink-0">
                      {prod.images[0]?.url ? (
                        <Image
                          src={prod.images[0].url}
                          alt={prod.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] text-neutral-300 flex items-center justify-center h-full">N/A</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-brand-black text-xs">{prod.name}</div>
                      <div className="text-[9px] text-neutral-400">{prod.sku}</div>
                      <div className="text-xs font-semibold text-brand-black mt-0.5">
                        ₹{(prod.pricePaise / 100).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-50 pt-2 text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                    <span>Status</span>
                    <ProductToggle
                      id={prod.id}
                      initialActive={prod.isActive}
                      onToggle={(newActive) => handleToggleStatus(prod.id, newActive)}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-50 pt-3">
                    <Link
                      href={`/admin/products/${prod.id}`}
                      className="text-[10px] font-bold text-brand-pink hover:text-brand-black uppercase tracking-wider transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDuplicate(prod.id)}
                      disabled={isPending}
                      className="text-[10px] font-bold text-neutral-400 hover:text-brand-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(prod.id)}
                      disabled={isPending}
                      className="text-[10px] font-bold text-red-400 hover:text-red-700 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-neutral-100 pt-6 mt-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-brand-black/10 rounded-xs text-neutral-500 hover:text-brand-black hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-brand-black/10 rounded-xs text-neutral-500 hover:text-brand-black hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 selection:bg-brand-pink/20">
          <div className="bg-white border border-brand-black/10 p-6 sm:p-8 rounded-xs max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-display text-lg tracking-wide text-brand-black mb-3">
              Delete Product permanently?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-6">
              This action cannot be easily undone. We recommend deactivating (archiving) the product instead so order histories remain intact.
            </p>
            <div className="flex items-center justify-end gap-3 text-[10px] font-bold uppercase tracking-widest">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 border border-brand-black/10 hover:bg-neutral-50 text-neutral-500 hover:text-brand-black transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isPending}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
