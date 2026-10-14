'use client';

import React, { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProductToggle from "./product-toggle";
import { duplicateProductAction, deleteProductAction, deactivateProductAction } from "@/actions/catalog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Copy,
  Archive,
  Trash2,
  Edit,
  Tag,
  SlidersHorizontal,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface VariantItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  inventoryQuantity?: number;
  isAvailable?: boolean;
  isActive?: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  isActive: boolean;
  categoryId: string;
  updatedAt?: string | Date | null;
  images: { url: string }[];
  variants?: VariantItem[];
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
  const router = useRouter();
  const [productsList, setProductsList] = useState<ProductItem[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [sortField, setSortField] = useState<"name" | "price" | "stock" | "updated">("updated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isPending, startTransition] = useTransition();

  // Sync state whenever server revalidates and passes new initialProducts
  useEffect(() => {
    setProductsList(initialProducts);
  }, [initialProducts]);

  // Action status states
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Map category IDs to names for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Helper to compute inventory stats for a product
  const getInventoryStats = (prod: ProductItem) => {
    const variants = prod.variants || [];
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const variantCount = variants.length;

    let status: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";

    if (variantCount > 0) {
      const allZeroOrUnavailable = variants.every(
        (v) => (v.stock || 0) <= 0 || v.isAvailable === false
      );
      if (allZeroOrUnavailable) {
        status = "out_of_stock";
      } else if (variants.some((v) => (v.stock || 0) > 0 && (v.stock || 0) <= 3)) {
        status = "low_stock";
      } else {
        status = "in_stock";
      }
    } else {
      status = "in_stock";
    }

    // Navratri promotional preview (20% off)
    const promoPricePaise = Math.round(prod.pricePaise * 0.8);

    return { totalStock, variantCount, status, promoPricePaise };
  };

  // Handle Search, Filter and Sorting logic
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((prod) => {
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

        const { status } = getInventoryStats(prod);
        const matchesStock =
          stockFilter === "all" ||
          (stockFilter === "in_stock" && status === "in_stock") ||
          (stockFilter === "low_stock" && status === "low_stock") ||
          (stockFilter === "out_of_stock" && status === "out_of_stock");

        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === "name") {
          cmp = a.name.localeCompare(b.name);
        } else if (sortField === "price") {
          cmp = a.pricePaise - b.pricePaise;
        } else if (sortField === "stock") {
          const stockA = getInventoryStats(a).totalStock;
          const stockB = getInventoryStats(b).totalStock;
          cmp = stockA - stockB;
        } else if (sortField === "updated") {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          cmp = dateA - dateB;
        }
        return sortDirection === "asc" ? cmp : -cmp;
      });
  }, [productsList, search, selectedCategory, statusFilter, stockFilter, sortField, sortDirection]);

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
    router.refresh();
  };

  const handleDuplicate = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await duplicateProductAction(id);
      if (res.success) {
        showToast("Product duplicated successfully.");
        router.refresh();
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
        router.refresh();
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
        showToast("Product deleted successfully.");
        setProductsList(productsList.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        showToast(res.error || "Failed to delete product.", true);
        setDeleteConfirmId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {message && (
        <div
          className={`p-4 rounded-xs border text-xs flex items-center justify-between gap-3 ${
            message.isError ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {message.isError ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-[10px] uppercase font-bold tracking-widest underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Shortcut Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xs border border-brand-black/10 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
          <span>Catalog Total:</span>
          <span className="font-bold text-brand-black">{productsList.length} Products</span>
          <span className="text-neutral-300">|</span>
          <span className="text-emerald-700">{productsList.filter((p) => p.isActive).length} Live</span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-500">{productsList.filter((p) => !p.isActive).length} Draft/Archived</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/prices"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-brand-black text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Bulk Edit Prices</span>
          </Link>
          <Link
            href="/admin/promotions"
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-pink/10 hover:bg-brand-pink/15 text-brand-pink text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Promotions</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-brand-black/10 p-5 rounded-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 text-xs font-sans rounded-xs focus:outline-none focus:border-brand-sage"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xs focus:outline-none"
              >
                <option value="all">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xs focus:outline-none"
              >
                <option value="all">All</option>
                <option value="active">Live on Store</option>
                <option value="inactive">Draft / Hidden</option>
              </select>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Stock:</span>
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xs focus:outline-none"
              >
                <option value="all">All Inventory</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock (≤ 3)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Sort:</span>
              <select
                value={`${sortField}_${sortDirection}`}
                onChange={(e) => {
                  const [f, d] = e.target.value.split("_");
                  setSortField(f as any);
                  setSortDirection(d as any);
                }}
                className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xs focus:outline-none"
              >
                <option value="updated_desc">Latest Updated</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="price_asc">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
                <option value="stock_asc">Stock (Low to High)</option>
                <option value="stock_desc">Stock (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-brand-black/10 rounded-xs overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                <th className="py-3.5 pr-4 pl-4">Product Details</th>
                <th className="py-3.5 px-3">SKU</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Selling Price</th>
                <th className="py-3.5 px-3">MRP</th>
                <th className="py-3.5 px-3 bg-brand-pink/5 text-brand-pink">Sale Price</th>
                <th className="py-3.5 px-3">Inventory</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-neutral-400">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const { totalStock, variantCount, status, promoPricePaise } = getInventoryStats(prod);

                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Product Details */}
                      <td className="py-3.5 pr-4 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 bg-neutral-100 border border-neutral-200 rounded-xs overflow-hidden flex-shrink-0">
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
                            <div className="font-bold text-brand-black line-clamp-1">{prod.name}</div>
                            <div className="text-[10px] text-neutral-400 font-mono mt-0.5 lowercase">{prod.slug}</div>
                            {prod.updatedAt && (
                              <div className="text-[9px] text-neutral-400 mt-0.5">
                                Updated {new Date(prod.updatedAt).toLocaleDateString("en-IN")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-3 font-mono font-bold text-neutral-700">
                        {prod.sku}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                        {categoryMap.get(prod.categoryId) || "Unassigned"}
                      </td>

                      {/* Canonical Selling Price */}
                      <td className="py-3.5 px-3 font-bold text-brand-black text-sm">
                        ₹{(prod.pricePaise / 100).toLocaleString("en-IN")}
                      </td>

                      {/* MRP */}
                      <td className="py-3.5 px-3 text-neutral-500 font-semibold">
                        {prod.compareAtPricePaise ? (
                          <span>₹{(prod.compareAtPricePaise / 100).toLocaleString("en-IN")}</span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>

                      {/* Sale Price Preview */}
                      <td className="py-3.5 px-3 bg-brand-pink/5 font-bold text-brand-pink">
                        ₹{(promoPricePaise / 100).toLocaleString("en-IN")}
                      </td>

                      {/* Inventory Status & Stock */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <div>
                            {status === "out_of_stock" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                                Out of Stock
                              </span>
                            ) : status === "low_stock" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                In Stock
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-medium">
                            {totalStock} units · {variantCount} sizes
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-3">
                        <ProductToggle
                          id={prod.id}
                          initialActive={prod.isActive}
                          onToggle={(newActive) => handleToggleStatus(prod.id, newActive)}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${prod.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-pink hover:text-brand-black uppercase tracking-wider p-1.5 rounded-xs transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(prod.id)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-brand-black uppercase tracking-wider p-1.5 rounded-xs transition-colors cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleArchive(prod.id)}
                            disabled={isPending || !prod.isActive}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-brand-black uppercase tracking-wider p-1.5 rounded-xs transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(prod.id)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-red-600 uppercase tracking-wider p-1.5 rounded-xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Showing page {currentPage} of {totalPages} ({filteredProducts.length} filtered items)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-neutral-200 rounded-xs disabled:opacity-30 hover:bg-white cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold px-2">{currentPage}</span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-neutral-200 rounded-xs disabled:opacity-30 hover:bg-white cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <h3 className="font-display text-lg font-bold">Delete Product Confirmation</h3>
            </div>
            <p className="text-xs text-neutral-600">
              Are you sure you want to delete this product? If this product has existing historical orders, deletion will be blocked to preserve financial and customer order history.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800 rounded-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isPending}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
              >
                {isPending ? "Checking & Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
