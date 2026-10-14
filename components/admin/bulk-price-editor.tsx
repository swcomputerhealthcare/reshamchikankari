'use client';

import React, { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bulkUpdatePricesAction } from "@/actions/catalog";
import {
  Search,
  Filter,
  Download,
  Upload,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Layers,
  HelpCircle
} from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  slug: string;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  categoryId: string;
  isActive: boolean;
  images: { url: string }[];
}

interface CategoryItem {
  id: string;
  name: string;
}

interface BulkPriceEditorProps {
  initialProducts: ProductItem[];
  categories: CategoryItem[];
  campaignConfig?: {
    isActive: boolean;
    discountPercentage: number;
    campaignName: string;
  };
}

export default function BulkPriceEditor({
  initialProducts,
  categories,
  campaignConfig = { isActive: true, discountPercentage: 20, campaignName: "Navratri Sale" },
}: BulkPriceEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Price edits stored per product id: { price: string (INR), comparePrice: string (INR) }
  const [edits, setEdits] = useState<Record<string, { price: string; comparePrice: string }>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Search, filter, and sorting
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortField, setSortField] = useState<"name" | "sku" | "price" | "category">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Modals & Panels
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvErrors, setCsvErrors] = useState<string[]>([]);

  // Feedback states
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [saveReport, setSaveReport] = useState<{
    success: boolean;
    totalCount: number;
    successCount: number;
    failureCount: number;
    results: { id: string; success: boolean; error?: string }[];
  } | null>(null);

  // Category map
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Helper to get current working values for a product
  const getProductValues = (prod: ProductItem) => {
    const edit = edits[prod.id];
    const currentPriceStr = edit ? edit.price : (prod.pricePaise / 100).toString();
    const currentCompareStr = edit
      ? edit.comparePrice
      : prod.compareAtPricePaise
      ? (prod.compareAtPricePaise / 100).toString()
      : "";

    const priceNum = parseFloat(currentPriceStr) || 0;
    const compareNum = currentCompareStr ? parseFloat(currentCompareStr) || 0 : null;

    // Promotional calculation
    let promoPriceNum = priceNum;
    if (campaignConfig.isActive && campaignConfig.discountPercentage > 0) {
      const discountPaise = Math.round(priceNum * 100 * (campaignConfig.discountPercentage / 100));
      promoPriceNum = Math.max(0, (priceNum * 100 - discountPaise) / 100);
    }

    const isPriceDirty = edit && parseFloat(edit.price) !== prod.pricePaise / 100;
    const isCompareDirty =
      edit &&
      (edit.comparePrice === "" && prod.compareAtPricePaise !== null
        ? true
        : edit.comparePrice !== "" &&
          parseFloat(edit.comparePrice) !== (prod.compareAtPricePaise ? prod.compareAtPricePaise / 100 : null));

    return {
      priceStr: currentPriceStr,
      compareStr: currentCompareStr,
      priceNum,
      compareNum,
      promoPriceNum,
      isPriceDirty,
      isCompareDirty,
      isDirty: isPriceDirty || isCompareDirty,
    };
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((prod) => {
        const matchesSearch =
          prod.name.toLowerCase().includes(search.toLowerCase()) ||
          prod.sku.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "all" || prod.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === "name") {
          cmp = a.name.localeCompare(b.name);
        } else if (sortField === "sku") {
          cmp = a.sku.localeCompare(b.sku);
        } else if (sortField === "price") {
          cmp = a.pricePaise - b.pricePaise;
        } else if (sortField === "category") {
          const catA = categoryMap.get(a.categoryId) || "";
          const catB = categoryMap.get(b.categoryId) || "";
          cmp = catA.localeCompare(catB);
        }
        return sortDirection === "asc" ? cmp : -cmp;
      });
  }, [initialProducts, search, selectedCategory, sortField, sortDirection, categoryMap]);

  // Dirty count
  const dirtyCount = useMemo(() => {
    return initialProducts.filter((p) => {
      const { isDirty } = getProductValues(p);
      return isDirty;
    }).length;
  }, [initialProducts, edits]);

  // Handlers for single edits
  const handlePriceChange = (id: string, newPrice: string) => {
    setEdits((prev) => {
      const existing = prev[id] || {
        price: (initialProducts.find((p) => p.id === id)?.pricePaise || 0) / 100 + "",
        comparePrice: (initialProducts.find((p) => p.id === id)?.compareAtPricePaise || 0) / 100 + "",
      };
      return {
        ...prev,
        [id]: { ...existing, price: newPrice },
      };
    });
  };

  const handleComparePriceChange = (id: string, newCompare: string) => {
    setEdits((prev) => {
      const existing = prev[id] || {
        price: (initialProducts.find((p) => p.id === id)?.pricePaise || 0) / 100 + "",
        comparePrice: (initialProducts.find((p) => p.id === id)?.compareAtPricePaise || 0) / 100 + "",
      };
      return {
        ...prev,
        [id]: { ...existing, comparePrice: newCompare },
      };
    });
  };

  const handleResetProduct = (id: string) => {
    setEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleResetAll = () => {
    setEdits({});
    setSelectedIds(new Set());
    setFeedback({ text: "All modified prices reset to database defaults.", isError: false });
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Batch Adjustments
  const [batchType, setBatchType] = useState<"percentage_discount" | "percentage_markup" | "fixed_price" | "set_mrp_margin">("percentage_discount");
  const [batchValue, setBatchValue] = useState<string>("10");

  const handleApplyBatchAdjustment = () => {
    const val = parseFloat(batchValue);
    if (isNaN(val) || val <= 0) {
      setFeedback({ text: "Please enter a valid positive number for adjustment.", isError: true });
      return;
    }

    if (selectedIds.size === 0) {
      setFeedback({ text: "Please select at least one product to adjust.", isError: true });
      return;
    }

    const updatedEdits = { ...edits };

    initialProducts.forEach((prod) => {
      if (!selectedIds.has(prod.id)) return;

      const currentVals = getProductValues(prod);
      let newPriceNum = currentVals.priceNum;
      let newCompareNum = currentVals.compareNum;

      if (batchType === "percentage_discount") {
        newPriceNum = Math.round(newPriceNum * (1 - val / 100));
      } else if (batchType === "percentage_markup") {
        newPriceNum = Math.round(newPriceNum * (1 + val / 100));
      } else if (batchType === "fixed_price") {
        newPriceNum = val;
      } else if (batchType === "set_mrp_margin") {
        // Sets MRP = newPrice + val%
        newCompareNum = Math.round(newPriceNum * (1 + val / 100));
      }

      updatedEdits[prod.id] = {
        price: newPriceNum.toString(),
        comparePrice: newCompareNum ? newCompareNum.toString() : "",
      };
    });

    setEdits(updatedEdits);
    setIsBatchOpen(false);
    setFeedback({
      text: `Applied batch adjustment to ${selectedIds.size} selected products. Review changes below.`,
      isError: false,
    });
  };

  // CSV Export
  const handleExportCsv = () => {
    const rows = [
      ["Product ID", "SKU", "Name", "Category", "Current Selling Price (INR)", "New Selling Price (INR)", "Current MRP (INR)", "New MRP (INR)"],
    ];

    filteredProducts.forEach((prod) => {
      const vals = getProductValues(prod);
      rows.push([
        prod.id,
        prod.sku,
        `"${prod.name.replace(/"/g, '""')}"`,
        `"${(categoryMap.get(prod.categoryId) || "Unassigned").replace(/"/g, '""')}"`,
        (prod.pricePaise / 100).toFixed(2),
        vals.priceNum.toFixed(2),
        prod.compareAtPricePaise ? (prod.compareAtPricePaise / 100).toFixed(2) : "",
        vals.compareNum ? vals.compareNum.toFixed(2) : "",
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `resham_products_prices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCsv = () => {
    setCsvErrors([]);
    if (!csvText.trim()) {
      setCsvErrors(["CSV input cannot be empty."]);
      return;
    }

    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      setCsvErrors(["CSV must contain a header row and at least one data row."]);
      return;
    }

    const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const idIdx = header.findIndex((h) => h.includes("product id") || h === "id");
    const skuIdx = header.findIndex((h) => h.includes("sku"));
    const priceIdx = header.findIndex((h) => h.includes("new selling price") || h.includes("selling price") || h === "price");
    const mrpIdx = header.findIndex((h) => h.includes("new mrp") || h.includes("mrp") || h.includes("compare at"));

    if (idIdx === -1 && skuIdx === -1) {
      setCsvErrors(["CSV must contain either a 'Product ID' or 'SKU' column for stable product matching."]);
      return;
    }

    if (priceIdx === -1) {
      setCsvErrors(["CSV must contain a 'New Selling Price' or 'Price' column."]);
      return;
    }

    const newEdits = { ...edits };
    const errors: string[] = [];
    let matchCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const idVal = idIdx !== -1 ? cols[idIdx] : null;
      const skuVal = skuIdx !== -1 ? cols[skuIdx] : null;
      const priceVal = cols[priceIdx];
      const mrpVal = mrpIdx !== -1 ? cols[mrpIdx] : null;

      // Find matching product
      const product = initialProducts.find((p) => (idVal && p.id === idVal) || (skuVal && p.sku.toUpperCase() === skuVal.toUpperCase()));

      if (!product) {
        errors.push(`Row ${i + 1}: No product found matching ID "${idVal}" or SKU "${skuVal}".`);
        continue;
      }

      const parsedPrice = parseFloat(priceVal);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        errors.push(`Row ${i + 1} (${product.sku}): Invalid price "${priceVal}". Must be greater than 0.`);
        continue;
      }

      const existingEdit = newEdits[product.id] || {
        price: (product.pricePaise / 100).toString(),
        comparePrice: product.compareAtPricePaise ? (product.compareAtPricePaise / 100).toString() : "",
      };

      existingEdit.price = parsedPrice.toString();
      if (mrpVal !== null && mrpVal !== undefined && mrpVal !== "") {
        const parsedMrp = parseFloat(mrpVal);
        if (!isNaN(parsedMrp) && parsedMrp > 0) {
          existingEdit.comparePrice = parsedMrp.toString();
        }
      }

      newEdits[product.id] = existingEdit;
      matchCount++;
    }

    if (errors.length > 0 && matchCount === 0) {
      setCsvErrors(errors);
      return;
    }

    setEdits(newEdits);
    setIsImportOpen(false);
    setCsvText("");
    setFeedback({
      text: `Successfully imported prices for ${matchCount} products. ${errors.length > 0 ? `${errors.length} rows had errors.` : ""}`,
      isError: errors.length > 0 && matchCount === 0,
    });
  };

  // Compile list of modified items for Review Screen
  const modifiedProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        const { isDirty } = getProductValues(p);
        return isDirty;
      })
      .map((p) => {
        const vals = getProductValues(p);
        const originalPrice = p.pricePaise / 100;
        const newPrice = vals.priceNum;
        const priceDiff = newPrice - originalPrice;
        const priceDiffPercent = originalPrice > 0 ? ((priceDiff / originalPrice) * 100).toFixed(1) : "0";

        const originalMrp = p.compareAtPricePaise ? p.compareAtPricePaise / 100 : null;
        const newMrp = vals.compareNum;

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          originalPrice,
          newPrice,
          priceDiff,
          priceDiffPercent,
          originalMrp,
          newMrp,
          promoPrice: vals.promoPriceNum,
        };
      });
  }, [initialProducts, edits]);

  // Execute Database Save via Server Action
  const handleConfirmSave = () => {
    if (modifiedProducts.length === 0) return;

    startTransition(async () => {
      try {
        const updates = modifiedProducts.map((m) => ({
          id: m.id,
          pricePaise: Math.round(m.newPrice * 100),
          compareAtPricePaise: m.newMrp !== null ? Math.round(m.newMrp * 100) : null,
        }));

        const res = await bulkUpdatePricesAction(updates);

        if (res.results) {
          setSaveReport(res);
        }
        setIsReviewOpen(false);

        if (res.success && res.successCount) {
          // Clear saved edits
          setEdits({});
          setSelectedIds(new Set());
          setFeedback({
            text: `Successfully updated ${res.successCount} of ${res.totalCount} products in the database!`,
            isError: false,
          });
          router.refresh();
        } else {
          setFeedback({
            text: res.error || `Bulk update failed. ${res.failureCount || 0} products could not be updated. Check report below.`,
            isError: true,
          });
        }
      } catch (err: any) {
        setFeedback({
          text: err.message || "An unexpected error occurred while saving prices.",
          isError: true,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-5 rounded-xs border border-brand-black/10 shadow-xs">
        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-black flex items-center gap-2">
            <span>Bulk Price & MRP Manager</span>
            {campaignConfig.isActive && (
              <span className="text-[10px] bg-brand-pink/15 text-brand-pink px-2.5 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider">
                {campaignConfig.campaignName} · {campaignConfig.discountPercentage}% ACTIVE
              </span>
            )}
          </h2>
          <p className="text-xs text-neutral-500 font-sans mt-0.5">
            Modify canonical selling prices and MRPs across multiple products simultaneously with live promotional calculation preview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Batch Adjust Button */}
          <button
            type="button"
            onClick={() => setIsBatchOpen(true)}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors disabled:opacity-40 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Batch Adjust ({selectedIds.size})</span>
          </button>

          {/* CSV Import */}
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </button>

          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          {/* Reset All */}
          {dirtyCount > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-2 text-neutral-500 hover:text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}

          {/* Review & Save Button */}
          <button
            type="button"
            onClick={() => setIsReviewOpen(true)}
            disabled={dirtyCount === 0 || isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-xs font-bold uppercase tracking-widest rounded-xs transition-all shadow-xs disabled:opacity-40 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Review & Save ({dirtyCount})</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xs border text-xs flex items-center justify-between gap-3 ${
            feedback.isError ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.isError ? <AlertCircle className="h-4 w-4 flex-shrink-0" /> : <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[10px] uppercase font-bold tracking-widest underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Save Report Banner */}
      {saveReport && (
        <div className="bg-white border border-neutral-200 p-4 rounded-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">
              Bulk Update Result: {saveReport.successCount} of {saveReport.totalCount} products updated successfully
            </span>
            <button
              type="button"
              onClick={() => setSaveReport(null)}
              className="text-neutral-400 hover:text-neutral-700 text-xs"
            >
              ✕
            </button>
          </div>
          {saveReport.failureCount > 0 && (
            <div className="space-y-1.5 text-xs text-red-600 bg-red-50 p-3 rounded-xs border border-red-100">
              <div className="font-bold">Failed Updates:</div>
              {saveReport.results
                .filter((r) => !r.success)
                .map((r) => (
                  <div key={r.id}>
                    • Product ID <span className="font-mono font-bold">{r.id}</span>: {r.error}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xs border border-brand-black/10">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-brand-sage text-xs font-sans rounded-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 text-xs font-sans font-semibold text-brand-black focus:outline-none rounded-xs"
            >
              <option value="all">All Categories ({initialProducts.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Sort:</span>
            <select
              value={`${sortField}_${sortDirection}`}
              onChange={(e) => {
                const [f, d] = e.target.value.split("_");
                setSortField(f as any);
                setSortDirection(d as any);
              }}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 text-xs font-sans font-semibold text-brand-black focus:outline-none rounded-xs"
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="sku_asc">SKU (A-Z)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Pricing Table */}
      <div className="bg-white border border-brand-black/10 rounded-xs overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-brand-sage focus:ring-brand-sage border-neutral-300 rounded-xs cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-4 w-48">
                  <div className="flex items-center gap-1">
                    <span>Canonical Selling Price (₹)</span>
                  </div>
                </th>
                <th className="py-3 px-4 w-44">
                  <div className="flex items-center gap-1">
                    <span>MRP / Compare (₹)</span>
                  </div>
                </th>
                <th className="py-3 px-4 w-48 bg-brand-pink/5">
                  <div className="flex items-center gap-1 text-brand-pink font-bold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Customer Sale Price</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const vals = getProductValues(prod);
                  const isSelected = selectedIds.has(prod.id);

                  return (
                    <tr
                      key={prod.id}
                      className={`transition-colors ${
                        vals.isDirty ? "bg-amber-50/40" : isSelected ? "bg-neutral-50/70" : "hover:bg-neutral-50/50"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(prod.id)}
                          className="h-4 w-4 text-brand-sage focus:ring-brand-sage border-neutral-300 rounded-xs cursor-pointer"
                        />
                      </td>

                      {/* Product & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 bg-neutral-100 border border-neutral-200 rounded-xs overflow-hidden flex-shrink-0">
                            {prod.images[0]?.url ? (
                              <Image
                                src={prod.images[0].url}
                                alt={prod.name}
                                width={44}
                                height={44}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[9px] text-neutral-300 flex items-center justify-center h-full">N/A</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-brand-black line-clamp-1">{prod.name}</div>
                            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{prod.sku}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                        {categoryMap.get(prod.categoryId) || "Unassigned"}
                      </td>

                      {/* Canonical Selling Price Input */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={vals.priceStr}
                              onChange={(e) => handlePriceChange(prod.id, e.target.value)}
                              className={`w-full pl-7 pr-3 py-1.5 font-sans font-bold text-sm text-brand-black bg-white border rounded-xs focus:outline-none focus:border-brand-sage transition-all ${
                                vals.isPriceDirty ? "border-amber-400 ring-1 ring-amber-400 bg-amber-50/20" : "border-neutral-200"
                              }`}
                            />
                          </div>
                          {vals.isPriceDirty && (
                            <div className="text-[10px] text-amber-600 font-medium">
                              Original: ₹{(prod.pricePaise / 100).toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Compare At Price (MRP) Input */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Optional"
                              value={vals.compareStr}
                              onChange={(e) => handleComparePriceChange(prod.id, e.target.value)}
                              className={`w-full pl-7 pr-3 py-1.5 font-sans text-xs text-neutral-700 bg-white border rounded-xs focus:outline-none focus:border-brand-sage transition-all ${
                                vals.isCompareDirty ? "border-amber-400 ring-1 ring-amber-400 bg-amber-50/20" : "border-neutral-200"
                              }`}
                            />
                          </div>
                          {vals.isCompareDirty && (
                            <div className="text-[10px] text-amber-600 font-medium">
                              Original: {prod.compareAtPricePaise ? `₹${(prod.compareAtPricePaise / 100).toLocaleString("en-IN")}` : "None"}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Promotional Calculated Price */}
                      <td className="py-3.5 px-4 bg-brand-pink/5">
                        <div>
                          <div className="font-bold text-brand-pink text-sm">
                            ₹{vals.promoPriceNum.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[9px] text-neutral-400 font-medium mt-0.5">
                            {campaignConfig.isActive ? `${campaignConfig.discountPercentage}% campaign applied` : "Normal canonical price"}
                          </div>
                        </div>
                      </td>

                      {/* Row Action */}
                      <td className="py-3.5 px-3 text-right">
                        {vals.isDirty && (
                          <button
                            type="button"
                            onClick={() => handleResetProduct(prod.id)}
                            className="text-[10px] text-neutral-400 hover:text-neutral-700 uppercase font-bold tracking-wider px-2 py-1 rounded-xs hover:bg-neutral-100 transition-colors cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Batch Adjust Modal */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="font-display text-xl font-bold text-brand-black">
                Batch Adjust Prices ({selectedIds.size} Products)
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Apply a uniform price change to all currently selected products. You can preview all changes before saving.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                  Adjustment Type
                </label>
                <select
                  value={batchType}
                  onChange={(e) => setBatchType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 text-xs font-semibold focus:outline-none rounded-xs"
                >
                  <option value="percentage_discount">Decrease Canonical Price by %</option>
                  <option value="percentage_markup">Increase Canonical Price by %</option>
                  <option value="fixed_price">Set Fixed Selling Price (₹)</option>
                  <option value="set_mrp_margin">Set MRP as Selling Price + % Margin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                  Value ({batchType === "fixed_price" ? "₹ Amount" : "Percentage %"})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                  placeholder={batchType === "fixed_price" ? "e.g. 2495" : "e.g. 10"}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 text-sm font-bold text-brand-black focus:outline-none rounded-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsBatchOpen(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800 rounded-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBatchAdjustment}
                className="px-5 py-2 bg-brand-sage hover:bg-[#324027] text-white text-xs font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
              >
                Apply to Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CSV Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="font-display text-xl font-bold text-brand-black">Import Prices from CSV</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Paste your CSV content below. Must include either <code className="bg-neutral-100 px-1 font-mono">Product ID</code> or{" "}
                <code className="bg-neutral-100 px-1 font-mono">SKU</code>, and{" "}
                <code className="bg-neutral-100 px-1 font-mono">New Selling Price</code>.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Product ID,SKU,New Selling Price,New MRP\nprod_123,RES-KUR-01,2499,3999\nprod_456,RES-CHIP-02,1995,2995`}
                className="w-full p-3 font-mono text-xs bg-neutral-50 border border-neutral-200 rounded-xs focus:outline-none focus:border-brand-sage"
              />
            </div>

            {csvErrors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-700 max-h-36 overflow-y-auto space-y-1">
                <div className="font-bold">Errors found in CSV:</div>
                {csvErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800 rounded-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                className="px-5 py-2 bg-brand-sage hover:bg-[#324027] text-white text-xs font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
              >
                Parse & Load Prices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Review and Confirmation Screen (Phase 4 requirement) */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-3xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex-shrink-0">
              <h3 className="font-display text-2xl font-bold text-brand-black">
                Review Price Changes ({modifiedProducts.length} Products)
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Please verify each proposed price update before writing to the production database.
              </p>
            </div>

            {/* Changes Table */}
            <div className="flex-1 overflow-y-auto border border-neutral-200 rounded-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                    <th className="py-2.5 px-3">Product / SKU</th>
                    <th className="py-2.5 px-3">Selling Price Change</th>
                    <th className="py-2.5 px-3">MRP Change</th>
                    <th className="py-2.5 px-3 text-brand-pink bg-brand-pink/5">New Sale Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  {modifiedProducts.map((m) => (
                    <tr key={m.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-brand-black">{m.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{m.sku}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 line-through">₹{m.originalPrice.toLocaleString("en-IN")}</span>
                          <span className="font-bold text-brand-black">₹{m.newPrice.toLocaleString("en-IN")}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              m.priceDiff > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {m.priceDiff > 0 ? `+₹${m.priceDiff}` : `-₹${Math.abs(m.priceDiff)}`} ({m.priceDiffPercent}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">
                            {m.originalMrp ? `₹${m.originalMrp.toLocaleString("en-IN")}` : "None"}
                          </span>
                          <ChevronRight className="h-3 w-3 text-neutral-300" />
                          <span className="font-semibold text-neutral-800">
                            {m.newMrp ? `₹${m.newMrp.toLocaleString("en-IN")}` : "Unset"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 bg-brand-pink/5 font-bold text-brand-pink">
                        ₹{m.promoPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex-shrink-0 flex items-center justify-between pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                disabled={isPending}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800 rounded-xs cursor-pointer"
              >
                Back to Table
              </button>

              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-xs font-bold uppercase tracking-widest rounded-xs transition-all shadow-xs cursor-pointer disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                <span>{isPending ? "Writing to Database..." : "Confirm & Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
