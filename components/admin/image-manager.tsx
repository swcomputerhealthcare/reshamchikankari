'use client';

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Star, ArrowLeft, ArrowRight, Loader2, ImagePlus } from "lucide-react";
import { uploadAdminImageAction } from "@/actions/upload";

export interface ManagedImage {
  id?: string;
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ImageManagerProps {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
  maxImages?: number;
}

export default function ImageManager({ images, onChange, maxImages = 10 }: ImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg("");
    setIsUploading(true);

    const newImages: ManagedImage[] = [...images];

    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= maxImages) {
        setErrorMsg(`Maximum of ${maxImages} images allowed per product.`);
        break;
      }

      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadAdminImageAction(formData);
      if (res.success && res.image) {
        const isFirst = newImages.length === 0;
        newImages.push({
          url: res.image.url,
          publicId: res.image.publicId,
          altText: file.name.replace(/\.[^/.]+$/, ""),
          isPrimary: isFirst,
          sortOrder: newImages.length,
        });
      } else {
        setErrorMsg(res.error || "Failed to upload image.");
      }
    }

    onChange(newImages);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const filtered = images.filter((_, i) => i !== index);
    // Re-assign primary if removed image was primary
    if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    // Re-assign sortOrder
    const reordered = filtered.map((img, i) => ({ ...img, sortOrder: i }));
    onChange(reordered);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Update sortOrder values
    const reordered = updated.map((img, i) => ({ ...img, sortOrder: i }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
          Product Gallery ({images.length} / {maxImages})
        </label>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-sage hover:bg-[#324027] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-xs disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              <span>+ Add Images</span>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-xs p-3 border border-red-200 font-medium rounded-xs">
          {errorMsg}
        </div>
      )}

      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-300 hover:border-brand-sage bg-neutral-50/60 p-8 text-center rounded-xs cursor-pointer transition-colors"
        >
          <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
          <div className="text-sm font-semibold text-brand-black">Click to Browse & Upload Product Images</div>
          <div className="text-xs text-neutral-400 mt-1">Supports PNG, JPG, WebP, AVIF up to 10MB</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, index) => (
            <div
              key={img.url + index}
              className={`relative group bg-white border ${
                img.isPrimary ? "border-brand-sage ring-2 ring-brand-sage/20" : "border-neutral-200"
              } p-2 rounded-xs space-y-2 shadow-xs transition-all`}
            >
              {/* Image Preview */}
              <div className="relative h-28 w-full bg-neutral-50 rounded-xs overflow-hidden">
                <Image
                  src={img.url}
                  alt={img.altText || "Product photo"}
                  fill
                  className="object-cover"
                />
                {img.isPrimary && (
                  <span className="absolute top-1.5 left-1.5 bg-brand-sage text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-xs shadow-xs flex items-center gap-1">
                    <Star className="h-3 w-3 fill-white" /> Primary
                  </span>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-neutral-100">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Move Left"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "left")}
                    className="p-1 text-neutral-400 hover:text-brand-black disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move Right"
                    disabled={index === images.length - 1}
                    onClick={() => handleMove(index, "right")}
                    className="p-1 text-neutral-400 hover:text-brand-black disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="text-[10px] text-brand-sage hover:underline font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Set Primary
                  </button>
                )}

                <button
                  type="button"
                  title="Remove Image"
                  onClick={() => handleRemove(index)}
                  className="p-1 text-red-400 hover:text-red-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
