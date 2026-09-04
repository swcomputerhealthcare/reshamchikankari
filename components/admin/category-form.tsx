'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction } from "@/actions/catalog";
import Button from "@/components/ui/button";

export default function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await createCategoryAction({
        name,
        slug,
        description,
        image: image || undefined,
        isActive: true,
      });

      if (!res.success) {
        setError(res.error || "Failed to create category.");
      } else {
        setName("");
        setSlug("");
        setDescription("");
        setImage("");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100">
        Create New Category
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-3 border border-red-100 font-sans">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="cat-name" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
          Category Name
        </label>
        <input
          id="cat-name"
          type="text"
          required
          value={name}
          onChange={handleNameChange}
          placeholder="e.g. Silk Edit"
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs font-sans"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="cat-slug" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
          Slug
        </label>
        <input
          id="cat-slug"
          type="text"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          placeholder="e.g. silk-edit"
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs font-sans"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="cat-image" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
          Category Banner Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("file", file);
            const { uploadAdminImageAction } = await import("@/actions/upload");
            const res = await uploadAdminImageAction(formData);
            if (res.success && res.image) {
              setImage(res.image.url);
            } else {
              setError(res.error || "Failed to upload image.");
            }
          }}
          className="w-full text-xs font-sans file:mr-3 file:py-1 file:px-3 file:border-0 file:text-[10px] file:font-bold file:bg-brand-sage file:text-white file:rounded-xs file:uppercase file:cursor-pointer"
        />
        <input
          id="cat-image"
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/cat.jpg (or upload file above)"
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs font-sans mt-1"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="cat-desc" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
          Description
        </label>
        <textarea
          id="cat-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs font-sans"
        />
      </div>

      <Button variant="primary" type="submit" className="w-full py-2.5 text-xs" isLoading={isLoading}>
        Add Category
      </Button>
    </form>
  );
}
