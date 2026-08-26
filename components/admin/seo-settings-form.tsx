'use client';

import React, { useState, useTransition } from "react";
import { updateSeoSettingsAction, updatePageSeoAction } from "@/actions/settings";
import { Save, Sparkles, Globe } from "lucide-react";

interface GlobalSeo {
  siteTitle: string;
  metaDescription: string;
  defaultOgImage?: string | null;
  canonical?: string | null;
}

interface PageSeo {
  id: string;
  path: string;
  title: string;
  description: string;
  canonicalUrl?: string | null;
  noIndex: boolean;
}

interface SeoSettingsFormProps {
  globalSeo: GlobalSeo | null;
  pagesSeo: PageSeo[];
}

export default function SeoSettingsForm({
  globalSeo,
  pagesSeo,
}: SeoSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);

  // Global SEO state
  const [siteTitle, setSiteTitle] = useState(globalSeo?.siteTitle || "Resham Chikankari");
  const [metaDescription, setMetaDescription] = useState(globalSeo?.metaDescription || "Luxury Chikankari wear.");
  const [ogImage, setOgImage] = useState(globalSeo?.defaultOgImage || "");
  const [globalCanonical, setGlobalCanonical] = useState(globalSeo?.canonical || "");

  // Page-specific SEO state
  const [selectedPath, setSelectedPath] = useState("/");
  const currentPageSeo = pagesSeo.find((p) => p.path === selectedPath);

  const [pageTitle, setPageTitle] = useState(currentPageSeo?.title || "");
  const [pageDesc, setPageDesc] = useState(currentPageSeo?.description || "");
  const [pageCanonical, setPageCanonical] = useState(currentPageSeo?.canonicalUrl || "");
  const [noIndex, setNoIndex] = useState(currentPageSeo?.noIndex || false);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGlobalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateSeoSettingsAction({
        siteTitle,
        metaDescription,
        defaultOgImage: ogImage || null,
        canonical: globalCanonical || null,
      });

      if (res.success) {
        showToast("Global site SEO updated successfully.");
      } else {
        showToast(res.error || "Failed to update Global SEO.", true);
      }
    });
  };

  const handlePageSelect = (path: string) => {
    setSelectedPath(path);
    const seo = pagesSeo.find((p) => p.path === path);
    setPageTitle(seo?.title || "");
    setPageDesc(seo?.description || "");
    setPageCanonical(seo?.canonicalUrl || "");
    setNoIndex(seo?.noIndex || false);
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle || !pageDesc) {
      showToast("Page Title and Meta Description are required.", true);
      return;
    }

    startTransition(async () => {
      const res = await updatePageSeoAction(selectedPath, {
        title: pageTitle,
        description: pageDesc,
        canonicalUrl: pageCanonical || null,
        noIndex,
      });

      if (res.success) {
        showToast(`SEO settings for ${selectedPath} updated.`);
      } else {
        showToast(res.error || "Failed to update Page SEO.", true);
      }
    });
  };

  const pageRoutes = [
    { label: "Homepage (/) ", path: "/" },
    { label: "Shop (/shop)", path: "/shop" },
    { label: "About Us (/about)", path: "/about" },
    { label: "Contact (/contact)", path: "/contact" },
    { label: "Wallet Hub (/wallet)", path: "/wallet" },
  ];

  return (
    <div className="font-sans text-xs space-y-10">
      {/* Toast Alert */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Global SEO Settings */}
        <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6 flex items-center gap-2">
            <Globe className="h-4.5 w-4.5 text-brand-pink" />
            <span>Global Site SEO Metadata</span>
          </h3>

          <form onSubmit={handleGlobalSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Site Title Suffix
              </span>
              <input
                type="text"
                required
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Site Meta Description
              </span>
              <textarea
                rows={4}
                required
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2 text-xs focus:outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Default OG Sharing Image URL
              </span>
              <input
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Global Canonical Base Link
              </span>
              <input
                type="url"
                value={globalCanonical}
                onChange={(e) => setGlobalCanonical(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer rounded-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save Global SEO</span>
            </button>
          </form>
        </div>

        {/* Page specific metadata overrides */}
        <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-brand-pink" />
            <span>Page Header Overrides</span>
          </h3>

          <form onSubmit={handlePageSubmit} className="space-y-4">
            {/* Route selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Select Site page Route
              </span>
              <select
                value={selectedPath}
                onChange={(e) => handlePageSelect(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs focus:outline-none font-semibold text-brand-black"
              >
                {pageRoutes.map((route) => (
                  <option key={route.path} value={route.path}>
                    {route.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Page Title Tag (Override)
              </span>
              <input
                type="text"
                required
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Page Meta Description Override
              </span>
              <textarea
                rows={3}
                required
                value={pageDesc}
                onChange={(e) => setPageDesc(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2 text-xs focus:outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Page Canonical Link
              </span>
              <input
                type="url"
                value={pageCanonical}
                onChange={(e) => setPageCanonical(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[10px] uppercase tracking-widest text-neutral-500">
                <input
                  type="checkbox"
                  checked={noIndex}
                  onChange={(e) => setNoIndex(e.target.checked)}
                  className="h-4.5 w-4.5 text-brand-sage focus:ring-brand-sage"
                />
                <span>Tell Search Engines not to index this page (Noindex)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer rounded-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save Page Meta</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
