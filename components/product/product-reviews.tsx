'use client';

import React, { useState, useTransition } from "react";
import { Star, CheckCircle2, MessageSquarePlus, Sparkles, Send } from "lucide-react";
import { submitPublicReviewAction } from "@/actions/review";

export interface ProductReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  isVerifiedPurchase: boolean;
  createdAt: Date | string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialReviews: ProductReviewItem[];
}

export default function ProductReviews({
  productId,
  productName,
  initialReviews,
}: ProductReviewsProps) {
  const [reviewsList, setReviewsList] = useState<ProductReviewItem[]>(initialReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const averageRating =
    reviewsList.length > 0
      ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
      : "5.0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || authorName.trim().length < 2) {
      setFeedback({ text: "Please enter your name.", isError: true });
      return;
    }
    if (!body.trim() || body.trim().length < 5) {
      setFeedback({ text: "Please write a review message (at least 5 characters).", isError: true });
      return;
    }

    startTransition(async () => {
      const res = await submitPublicReviewAction(
        authorName.trim(),
        rating,
        body.trim(),
        undefined,
        productId
      );

      if (res.success) {
        setFeedback({
          text: "Thank you! Your review has been submitted for moderation and will appear shortly.",
          isError: false,
        });
        setAuthorName("");
        setTitle("");
        setBody("");
        setIsFormOpen(false);
      } else {
        setFeedback({ text: res.error || "Failed to submit review.", isError: true });
      }
    });
  };

  return (
    <section id="reviews" className="border-t border-brand-black/10 pt-16 sm:pt-24 mt-16 sm:mt-24 font-sans">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 border text-xs font-bold uppercase tracking-widest rounded-xs shadow-lg transition-all ${
            feedback.isError
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-brand-black border-white/10 text-brand-offwhite"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Header & Rating Breakdown */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-brand-black/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-brand-sage">
              Artisanal Patronage
            </span>
            <span className="h-1 w-1 rounded-full bg-brand-sage" />
            <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-neutral-400">
              Verified Feedback
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl text-brand-black tracking-wide">
            Patron Reviews & Stories
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl font-sans">
            Real experiences from patrons who cherish this handcrafted {productName}.
          </p>
        </div>

        {/* Rating score badge & Write review CTA */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 bg-[#F8F4EF] border border-brand-black/5 px-4 py-2.5 rounded-xs">
            <div className="text-2xl font-bold font-display text-brand-black leading-none">
              {averageRating}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(parseFloat(averageRating))
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block mt-0.5">
                {reviewsList.length} {reviewsList.length === 1 ? "Review" : "Reviews"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-6 py-3 bg-brand-black hover:bg-neutral-800 text-brand-offwhite text-xs font-bold uppercase tracking-widest rounded-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <MessageSquarePlus className="w-4 h-4 text-brand-pink" />
            <span>{isFormOpen ? "Close Form" : "Write a Review"}</span>
          </button>
        </div>
      </div>

      {/* Review Submission Form Drawer */}
      {isFormOpen && (
        <div className="bg-[#FAF7F2] border border-brand-black/10 p-6 sm:p-8 rounded-xs my-8 shadow-sm transition-all animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-brand-black/10 pb-4">
              <div>
                <h3 className="font-display text-xl text-brand-black">
                  Share Your Experience
                </h3>
                <span className="text-xs text-neutral-500 block mt-0.5">
                  Your feedback helps other patrons choose authentic handcrafted Lucknowi Chikankari.
                </span>
              </div>
              <Sparkles className="w-5 h-5 text-brand-pink" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm font-sans">
              {/* Star Rating Picker */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase font-bold tracking-widest text-neutral-600 block">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = i + 1;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            starVal <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-neutral-600 ml-2">
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Name & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-bold tracking-widest text-neutral-600 block">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-white border border-brand-black/15 rounded-xs px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-sage text-brand-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-bold tracking-widest text-neutral-600 block">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exquisite hand embroidery!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-brand-black/15 rounded-xs px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-sage text-brand-black"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold tracking-widest text-neutral-600 block">
                  Your Review *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the fabric feel, embroidery details, fit, and craftsmanship..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-white border border-brand-black/15 rounded-xs px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-brand-sage text-brand-black leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-brand-black/15 text-neutral-600 hover:text-brand-black text-xs uppercase font-bold tracking-widest rounded-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-xs uppercase font-bold tracking-widest rounded-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPending ? "Submitting..." : "Submit Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reviews List Grid */}
      <div className="pt-8">
        {reviewsList.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#FAF7F2] rounded-xs border border-brand-black/5 space-y-3">
            <Star className="w-8 h-8 text-neutral-300 mx-auto stroke-1" />
            <div className="font-display text-lg text-brand-black">
              Be the first to review this piece
            </div>
            <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              Every Resham Chikankari garment carries centuries of Lucknow craftsmanship. Share your thoughts and help our patron community.
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-block mt-2 px-5 py-2 bg-brand-black text-white text-[11px] uppercase tracking-widest font-bold rounded-xs hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {reviewsList.map((rev) => {
              const dateStr =
                typeof rev.createdAt === "string"
                  ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : rev.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

              return (
                <div
                  key={rev.id}
                  className="bg-[#FAF7F2] p-6 sm:p-7 rounded-xs border border-brand-black/5 space-y-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-300"
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-[10px] text-neutral-400 font-sans tracking-wide">
                        {dateStr}
                      </span>
                    </div>

                    {rev.title && (
                      <h4 className="font-bold text-sm text-brand-black tracking-wide">
                        {rev.title}
                      </h4>
                    )}

                    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans italic">
                      &ldquo;{rev.body}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-brand-black/5 pt-3.5 mt-2">
                    <div className="font-bold text-xs text-brand-black">
                      {rev.authorName || "Valued Patron"}
                    </div>

                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-brand-sage bg-brand-sage/10 px-2 py-0.5 rounded-xs">
                        <CheckCircle2 className="w-3 h-3 text-brand-sage" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
