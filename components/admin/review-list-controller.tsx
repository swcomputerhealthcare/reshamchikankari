'use client';

import React, { useState, useTransition } from "react";
import { moderateReviewAction, deleteReviewAction, adminCreateReviewAction } from "@/actions/review";
import { Star, Check, X, Trash2, Plus, Sparkles } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName?: string | null;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: Date;
  user?: {
    fullName: string | null;
    email: string | null;
  } | null;
  product?: {
    name: string;
  } | null;
}

interface ProductItem {
  id: string;
  name: string;
}

interface ReviewListControllerProps {
  initialReviews: ReviewItem[];
  products: ProductItem[];
}

export default function ReviewListController({
  initialReviews,
  products,
}: ReviewListControllerProps) {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(initialReviews);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);

  // Form states for adding/importing a review
  const [authorName, setAuthorName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || "");
  const [rating, setRating] = useState("5");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [verified, setVerified] = useState(true);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleModerate = (id: string, isApproved: boolean) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await moderateReviewAction(id, isApproved);
      if (res.success) {
        showToast(isApproved ? "Review approved successfully." : "Review rejected.");
        setReviewsList(
          reviewsList.map((r) => (r.id === id ? { ...r, isApproved } : r))
        );
      } else {
        showToast(res.error || "Moderation failed.", true);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await deleteReviewAction(id);
      if (res.success) {
        showToast("Review deleted permanently.");
        setReviewsList(reviewsList.filter((r) => r.id !== id));
      } else {
        showToast(res.error || "Deletion failed.", true);
      }
    });
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !selectedProduct || !body.trim()) {
      showToast("Please enter patron name, select product, and write review.", true);
      return;
    }

    startTransition(async () => {
      const ratingNum = parseInt(rating, 10);
      const res = await adminCreateReviewAction(
        authorName.trim(),
        selectedProduct,
        ratingNum,
        title.trim(),
        body.trim(),
        verified
      );

      if (res.success) {
        showToast("Review submitted and published successfully.");
        const prod = products.find((p) => p.id === selectedProduct);
        
        setReviewsList([
          {
            id: `rev_${Date.now()}`,
            rating: ratingNum,
            title: title.trim() || null,
            body: body.trim(),
            authorName: authorName.trim(),
            isVerifiedPurchase: verified,
            isApproved: true,
            createdAt: new Date(),
            user: null,
            product: {
              name: prod?.name || "Product",
            },
          },
          ...reviewsList,
        ]);

        setAuthorName("");
        setTitle("");
        setBody("");
      } else {
        showToast(res.error || "Failed to import testimonial.", true);
      }
    });
  };

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
        {/* Moderation directory */}
        <div className="lg:col-span-8 bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs h-fit">
          <h2 className="text-base font-bold uppercase tracking-wider text-brand-black mb-6 flex items-center justify-between">
            <span>Reviews Moderation Queue</span>
            <span className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-sans font-semibold">
              {reviewsList.length} total
            </span>
          </h2>

          {reviewsList.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 text-sm">
              No reviews submitted yet.
            </div>
          ) : (
            <div className="space-y-6">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="border border-neutral-200 p-5 rounded-xs text-sm space-y-4 bg-white shadow-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-brand-black text-base">
                        {rev.authorName || rev.user?.fullName || rev.title || "Valued Patron"}
                      </div>
                      <div className="text-xs text-neutral-500 font-sans mt-1">
                        Product: <span className="font-semibold text-brand-black">{rev.product?.name || "Catalog Garment"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xs border border-amber-200/50">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-neutral-700 leading-relaxed font-sans pr-2 text-sm">
                    {rev.title && <span className="font-semibold block mb-1 text-brand-black">{rev.title}</span>}
                    {rev.body}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-neutral-100 pt-4 text-xs font-semibold text-neutral-500">
                    <div className="flex items-center gap-3">
                      <span className="uppercase text-[11px] font-bold tracking-wider text-neutral-400">Status:</span>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-xs tracking-wider uppercase ${
                          rev.isApproved
                            ? "bg-brand-sage/15 text-brand-sage border border-brand-sage/30"
                            : "bg-amber-100 text-amber-800 border border-amber-300/50 animate-pulse"
                        }`}
                      >
                        {rev.isApproved ? "Approved" : "Pending Moderation"}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span className="text-brand-pink font-bold text-xs uppercase tracking-wider">Verified Buyer</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {!rev.isApproved ? (
                        <button
                          type="button"
                          onClick={() => handleModerate(rev.id, true)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 text-xs text-white bg-brand-sage hover:bg-[#324027] px-3.5 py-1.5 rounded-xs transition-all cursor-pointer font-bold tracking-wider uppercase shadow-xs"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleModerate(rev.id, false)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3.5 py-1.5 rounded-xs transition-all cursor-pointer font-bold tracking-wider uppercase"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(rev.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 transition-colors cursor-pointer font-bold uppercase tracking-wider"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Testimonials Manual Importer */}
        <div className="lg:col-span-4 bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs h-fit">
          <h4 className="text-sm uppercase font-bold tracking-widest text-brand-sage flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-brand-pink animate-pulse" />
            <span>Testimonial Importer</span>
          </h4>

          <form onSubmit={handleImport} className="space-y-5 text-sm font-sans">
            {/* Patron / Reviewer Name Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-neutral-500 block">
                Patron / Reviewer Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma (or Patron Name)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/15 rounded-xs px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-sage text-brand-black"
              />
            </div>

            {/* Product Dropdown */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-neutral-500 block">
                Select Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/15 rounded-xs px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-sage text-brand-black"
              >
                {products.length === 0 ? (
                  <option value="catalog">General Catalog Garment</option>
                ) : (
                  products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Rating and Verified */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-widest text-neutral-500 block">
                  Rating Stars
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-neutral-50 border border-brand-black/15 rounded-xs px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:border-brand-sage text-brand-black"
                >
                  <option value="5">5 Stars ★★★★★</option>
                  <option value="4">4 Stars ★★★★☆</option>
                  <option value="3">3 Stars ★★★☆☆</option>
                  <option value="2">2 Stars ★★☆☆☆</option>
                  <option value="1">1 Star ★☆☆☆☆</option>
                </select>
              </div>

              <div className="flex flex-col justify-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase tracking-widest text-neutral-600">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="h-4.5 w-4.5 text-brand-sage focus:ring-brand-sage rounded-xs"
                  />
                  <span>Verified buyer</span>
                </label>
              </div>
            </div>

            {/* Title / Heading */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-neutral-500 block">
                Review Title / Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Absolutely exquisite shadow work!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/15 rounded-xs px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-sage font-medium text-brand-black"
              />
            </div>

            {/* Review text */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-neutral-500 block">
                Review Body Text
              </label>
              <textarea
                rows={4}
                placeholder="Write the customer review message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/15 rounded-xs px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-sage font-medium text-brand-black leading-relaxed"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-brand-sage hover:bg-[#324027] text-white text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer rounded-xs shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Import Testimonial</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
