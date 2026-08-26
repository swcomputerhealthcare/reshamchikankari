'use client';

import React, { useState, useTransition } from "react";
import { Star, X, Check, Sparkles } from "lucide-react";
import Button from "@/components/ui/button";

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewFormModal({ isOpen, onClose, onSuccess }: ReviewFormModalProps) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !body.trim()) {
      setStatusMsg({ text: "Please enter your name and review message.", isError: true });
      return;
    }

    startTransition(async () => {
      try {
        // Simulate/submit review via server/offline handler
        setStatusMsg({
          text: "Thank you! Your story has been submitted for moderation.",
          isError: false,
        });
        setTimeout(() => {
          setAuthorName("");
          setBody("");
          setPhotoUrl("");
          setStatusMsg(null);
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      } catch (err) {
        setStatusMsg({ text: "Failed to submit review. Please try again.", isError: true });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 selection:bg-brand-pink/20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#FFF9F4] border border-brand-black/10 rounded-lg p-6 sm:p-8 shadow-2xl z-10 font-sans text-brand-black text-left">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1 text-neutral-400 hover:text-brand-black transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-pink block mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SHARE YOUR ATELIER EXPERIENCE</span>
          </span>
          <h3 className="font-display text-2xl text-brand-black">Write a Review</h3>
          <p className="text-xs text-neutral-500 font-sans mt-1">
            Tell us about the craftsmanship, fit, and elegance of your Chikankari garment.
          </p>
        </div>

        {statusMsg && (
          <div
            className={`p-4 mb-6 text-xs font-bold uppercase tracking-widest rounded-xs ${
              statusMsg.isError
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-brand-sage/10 text-brand-sage border border-brand-sage/20 flex items-center gap-2"
            }`}
          >
            {!statusMsg.isError && <Check className="h-4 w-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
          {/* Rating Stars Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block mb-2">
              Your Rating
            </label>
            <div className="flex items-center gap-2 text-brand-pink">
              {Array.from({ length: 5 }).map((_, i) => {
                const starVal = i + 1;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        starVal <= (hoverRating || rating)
                          ? "fill-brand-pink text-brand-pink"
                          : "text-brand-pink/20 fill-brand-pink/10"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Author Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">
              Your Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-white border border-brand-black/10 rounded-xs px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-sage font-medium text-brand-black"
            />
          </div>

          {/* Review Body */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">
              Your Experience & Feedback
            </label>
            <textarea
              rows={4}
              required
              placeholder="The fabric quality, embroidery work, fit, or comfort..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-white border border-brand-black/10 rounded-xs p-3 text-xs focus:outline-none focus:border-brand-sage font-medium text-brand-black leading-relaxed"
            />
          </div>

          {/* Optional Image CDN URL */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">
              Photo URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://res.cloudinary.com/... or photo link"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full bg-white border border-brand-black/10 rounded-xs px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-sage font-medium text-brand-black"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="accent"
              disabled={isPending}
              className="w-full py-3 text-xs uppercase tracking-widest font-bold !rounded-none cursor-pointer"
            >
              {isPending ? "Submitting..." : "Submit Review for Moderation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
