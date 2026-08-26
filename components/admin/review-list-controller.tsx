'use client';

import React, { useState, useTransition } from "react";
import { moderateReviewAction, deleteReviewAction, adminCreateReviewAction } from "@/actions/review";
import { Star, Check, X, Trash2, Plus, Sparkles } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: Date;
  user: {
    fullName: string | null;
    email: string | null;
  };
  product: {
    name: string;
  };
}

interface ProductItem {
  id: string;
  name: string;
}

interface CustomerItem {
  id: string;
  fullName: string | null;
  email: string | null;
}

interface ReviewListControllerProps {
  initialReviews: ReviewItem[];
  products: ProductItem[];
  customers: CustomerItem[];
}

export default function ReviewListController({
  initialReviews,
  products,
  customers,
}: ReviewListControllerProps) {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(initialReviews);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);

  // Form states for manually importing a review
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id || "");
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
    if (!selectedCustomer || !selectedProduct || !body.trim()) {
      showToast("Please fill in all required importer fields.", true);
      return;
    }

    startTransition(async () => {
      const ratingNum = parseInt(rating, 10);
      const res = await adminCreateReviewAction(
        selectedCustomer,
        selectedProduct,
        ratingNum,
        title.trim(),
        body.trim(),
        verified
      );

      if (res.success) {
        showToast("Testimonial imported successfully.");
        // Append placeholder to local state for visual confirmation
        const cust = customers.find((c) => c.id === selectedCustomer);
        const prod = products.find((p) => p.id === selectedProduct);
        
        setReviewsList([
          {
            id: `rev_${Date.now()}`,
            rating: ratingNum,
            title: title.trim() || null,
            body: body.trim(),
            isVerifiedPurchase: verified,
            isApproved: true,
            createdAt: new Date(),
            user: {
              fullName: cust?.fullName || "Guest Customer",
              email: cust?.email || null,
            },
            product: {
              name: prod?.name || "Product",
            },
          },
          ...reviewsList,
        ]);

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
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">
            Reviews Moderation queue ({reviewsList.length})
          </h2>

          {reviewsList.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 text-xs">
              No reviews submitted yet.
            </div>
          ) : (
            <div className="space-y-6">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="border border-neutral-100 p-4 rounded-xs text-xs space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-brand-black">
                        {rev.user?.fullName || "Guest User"}
                      </div>
                      <div className="text-[9px] text-neutral-400 font-sans mt-0.5">
                        Product: <span className="font-semibold">{rev.product?.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-neutral-600 leading-relaxed font-sans pr-2">
                    {rev.title && <span className="font-semibold block mb-1">{rev.title}</span>}
                    {rev.body}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-50 pt-3 mt-3 text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span>Status:</span>
                      <span
                        className={`px-2 py-0.5 text-[8px] font-bold rounded-xs ${
                          rev.isApproved
                            ? "bg-brand-sage/10 text-brand-sage"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {rev.isApproved ? "Approved" : "Pending"}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span className="text-brand-pink font-semibold">Verified Purchase</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {!rev.isApproved ? (
                        <button
                          type="button"
                          onClick={() => handleModerate(rev.id, true)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 text-[10px] text-brand-sage hover:text-white hover:bg-brand-sage border border-brand-sage/20 px-2.5 py-1 rounded-xs transition-all cursor-pointer font-bold"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleModerate(rev.id, false)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 text-[10px] text-amber-600 hover:text-white hover:bg-amber-600 border border-amber-600/20 px-2.5 py-1 rounded-xs transition-all cursor-pointer font-bold"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(rev.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 text-[10px] text-red-400 hover:text-red-700 transition-colors cursor-pointer font-bold"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
        <div className="lg:col-span-4 bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs h-fit">
          <h4 className="text-xs uppercase font-bold tracking-widest text-brand-sage flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-brand-pink animate-pulse" />
            <span>Testimonial Importer</span>
          </h4>

          <form onSubmit={handleImport} className="space-y-4 text-xs font-sans">
            {/* Customer Dropdown */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Reviewer Profile
              </span>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2 text-xs focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName || "Guest Customer"} ({c.email || "No email"})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Dropdown */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Select Product
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

            {/* Rating and Verified */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                  Rating Stars
                </span>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2 text-xs focus:outline-none font-bold"
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div className="flex flex-col justify-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[10px] uppercase tracking-widest text-neutral-500">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="h-4.5 w-4.5 text-brand-sage focus:ring-brand-sage"
                  />
                  <span>Verified buyer</span>
                </label>
              </div>
            </div>

            {/* Title / Heading */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Review Title / Headline
              </span>
              <input
                type="text"
                placeholder="e.g. Absolutely beautiful kurti!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            {/* Review text */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Review Body Text
              </span>
              <textarea
                rows={4}
                placeholder="Write the copied testimonial description here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2 text-xs focus:outline-none leading-relaxed"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer rounded-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Import testimonial</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
