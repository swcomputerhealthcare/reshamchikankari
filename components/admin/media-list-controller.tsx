/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useTransition, useMemo } from "react";
import { createProductImageAction, deleteProductImageAction } from "@/actions/catalog";
import { Search, Plus, Trash2, Copy, Check, Sparkles } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  imageUrl: string | null;
  alt: string | null;
  altText: string | null;
  productId: string;
  productName: string;
  createdAt: Date;
}

interface ProductItem {
  id: string;
  name: string;
}

interface MediaListControllerProps {
  initialMedia: MediaItem[];
  products: ProductItem[];
}

export default function MediaListController({
  initialMedia,
  products,
}: MediaListControllerProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);

  // Add media form states
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || "");
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast("Image URL copied to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (isPending) return;
    if (!confirm("Are you sure you want to delete this media asset?")) return;

    startTransition(async () => {
      const res = await deleteProductImageAction(id);
      if (res.success) {
        showToast("Media asset deleted successfully.");
        setMediaList(mediaList.filter((m) => m.id !== id));
      } else {
        showToast(res.error || "Failed to delete asset.", true);
      }
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newUrl.trim()) {
      showToast("Please select a product and enter an image URL.", true);
      return;
    }

    startTransition(async () => {
      const res = await createProductImageAction(selectedProduct, {
        url: newUrl.trim(),
        altText: newAlt.trim() || "Product Image",
        isPrimary: false,
        sortOrder: 10,
      });

      if (res.success) {
        showToast("Media asset linked successfully.");
        const prod = products.find((p) => p.id === selectedProduct);
        setMediaList([
          {
            id: res.id || `img_${Date.now()}`,
            url: newUrl.trim(),
            imageUrl: newUrl.trim(),
            alt: newAlt.trim() || "Product Image",
            altText: newAlt.trim() || "Product Image",
            productId: selectedProduct,
            productName: prod?.name || "Product",
            createdAt: new Date(),
          },
          ...mediaList,
        ]);
        setNewUrl("");
        setNewAlt("");
      } else {
        showToast(res.error || "Failed to link asset.", true);
      }
    });
  };

  const filteredMedia = useMemo(() => {
    return mediaList.filter((m) =>
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      (m.altText && m.altText.toLowerCase().includes(search.toLowerCase())) ||
      (m.alt && m.alt.toLowerCase().includes(search.toLowerCase()))
    );
  }, [mediaList, search]);

  return (
    <div className="font-sans">
      {/* Toast alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 border text-xs font-bold uppercase tracking-widest rounded-xs shadow-md ${
            toast.isError
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-brand-black border-white/10 text-brand-offwhite"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Media grid list */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search assets by Product name or alt text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-brand-black/10 rounded-xs pl-10 pr-4 py-2.5 text-xs tracking-wide uppercase font-semibold text-brand-black focus:outline-none focus:border-brand-sage"
            />
          </div>

          <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">
              Asset Gallery ({filteredMedia.length})
            </h2>

            {filteredMedia.length === 0 ? (
              <div className="text-center py-20 text-neutral-400 text-xs">
                No media assets found.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {filteredMedia.map((media) => (
                  <div
                    key={media.id}
                    className="group border border-neutral-100 rounded-xs overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    {/* Media image container */}
                    <div className="aspect-[3/4] w-full bg-neutral-50 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={media.url}
                        alt={media.altText || media.alt || "Asset"}
                        className="h-full w-full object-contain p-1"
                      />

                      {/* Overlays */}
                      <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(media.id, media.url)}
                          className="p-2 bg-white/90 hover:bg-white text-neutral-700 hover:text-brand-black rounded-xs shadow-xs transition-colors cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedId === media.id ? <Check className="h-4 w-4 text-brand-sage" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(media.id)}
                          className="p-2 bg-white/90 hover:bg-red-50 text-neutral-700 hover:text-red-700 rounded-xs shadow-xs transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-3 text-[10px] space-y-1">
                      <span className="font-semibold text-brand-black block truncate" title={media.productName}>
                        {media.productName}
                      </span>
                      <span className="text-neutral-400 block truncate leading-normal" title={media.altText || media.alt || "No Alt text"}>
                        Alt: {media.altText || media.alt || "None"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Media Form panel */}
        <div className="lg:col-span-4 bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs h-fit">
          <h4 className="text-xs uppercase font-bold tracking-widest text-brand-sage flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-brand-pink" />
            <span>Link Asset Link</span>
          </h4>

          <form onSubmit={handleAdd} className="space-y-4 text-xs font-sans">
            {/* Product dropdown */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Select Catalog Product
              </span>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2 text-xs focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Asset URL */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Image CDN URL
              </span>
              <input
                type="url"
                required
                placeholder="https://res.cloudinary.com/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            {/* Alt text */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Alt Description (Accessibility)
              </span>
              <input
                type="text"
                placeholder="Close-up of zari embroidery on front neck"
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer rounded-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Link Image Asset</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
