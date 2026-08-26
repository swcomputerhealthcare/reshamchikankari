"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/helpers";
import { db } from "@/db";
import { products, categories, productVariants, productImages } from "@/db/schema/catalog";
import { eq } from "drizzle-orm";
import { z } from "zod";

const productInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  pricePaise: z.number().int().positive("Price must be positive"),
  compareAtPricePaise: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  image: z.string().url("Must be a valid URL").optional().nullable(),
  fabric: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  washCare: z.string().optional().nullable(),
  productNumber: z.number().int().optional().nullable(),
  featured: z.boolean().optional(),
  length: z.string().optional().nullable(),
  neckline: z.string().optional().nullable(),
  sleeves: z.string().optional().nullable(),
  occasion: z.string().optional().nullable(),
});

const categoryInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image: z.string().url("Must be a valid URL").optional(),
  isActive: z.boolean().default(true),
});

const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

export async function createProductAction(formData: z.infer<typeof productInputSchema>) {
  // 1. Authorize Admin
  await requireAdmin();

  // 2. Validate parameters
  const parsed = productInputSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // 3. Fallback check
  if (!hasDatabase()) {
    console.log("Offline simulation: Product created", data);
    return { success: true, message: "Database offline. Simulated product creation." };
  }

  try {
    const id = `prod_${Math.random().toString(36).substring(2, 11)}`;
    await db.insert(products).values({
      id,
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug.toLowerCase(),
      description: data.description,
      sku: data.sku.toUpperCase(),
      pricePaise: data.pricePaise,
      compareAtPricePaise: data.compareAtPricePaise,
      isActive: data.isActive,
    });

    if (data.image) {
      await db.insert(productImages).values({
        id: `img_${Math.random().toString(36).substring(2, 11)}`,
        productId: id,
        url: data.image,
        publicId: "manual",
        alt: data.name,
        sortOrder: 0,
      });
    }

    // Insert a default size variant
    await db.insert(productVariants).values({
      id: `var_${Math.random().toString(36).substring(2, 11)}`,
      productId: id,
      sku: `${data.sku.toUpperCase()}-M`,
      name: "M",
      pricePaise: data.pricePaise,
      stock: 10,
      isActive: true,
    });

    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true, id };
  } catch (error) {
    console.error("DB Create Product failed:", error);
    return { success: false, error: "Failed to create product in database." };
  }
}

export async function updateProductAction(id: string, formData: Partial<z.infer<typeof productInputSchema>>) {
  await requireAdmin();

  if (!hasDatabase()) {
    console.log("Offline simulation: Product updated", id, formData);
    return { success: true, message: "Database offline. Simulated product update." };
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (formData.name) updateData.name = formData.name;
    if (formData.slug) updateData.slug = formData.slug.toLowerCase();
    if (formData.categoryId) updateData.categoryId = formData.categoryId;
    if (formData.description !== undefined) updateData.description = formData.description;
    if (formData.sku) updateData.sku = formData.sku.toUpperCase();
    if (formData.pricePaise !== undefined) updateData.pricePaise = formData.pricePaise;
    if (formData.compareAtPricePaise !== undefined) updateData.compareAtPricePaise = formData.compareAtPricePaise;
    if (formData.isActive !== undefined) updateData.isActive = formData.isActive;
    
    // Extended columns:
    if (formData.fabric !== undefined) updateData.fabric = formData.fabric;
    if (formData.color !== undefined) updateData.color = formData.color;
    if (formData.washCare !== undefined) updateData.washCare = formData.washCare;
    if (formData.productNumber !== undefined) updateData.productNumber = formData.productNumber;
    if (formData.featured !== undefined) updateData.featured = formData.featured;
    if (formData.length !== undefined) updateData.length = formData.length;
    if (formData.neckline !== undefined) updateData.neckline = formData.neckline;
    if (formData.sleeves !== undefined) updateData.sleeves = formData.sleeves;
    if (formData.occasion !== undefined) updateData.occasion = formData.occasion;

    updateData.updatedAt = new Date();

    await db.update(products).set(updateData).where(eq(products.id, id));

    revalidatePath(`/product/${formData.slug || ""}`);
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("DB Update Product failed:", error);
    return { success: false, error: "Failed to update product." };
  }
}

export async function deactivateProductAction(id: string, active: boolean) {
  await requireAdmin();

  if (!hasDatabase()) {
    console.log("Offline simulation: Product active state changed", id, active);
    return { success: true };
  }

  try {
    await db.update(products).set({ isActive: active }).where(eq(products.id, id));
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("DB Deactivate Product failed:", error);
    return { success: false, error: "Failed to update product status." };
  }
}

export async function createCategoryAction(formData: z.infer<typeof categoryInputSchema>) {
  await requireAdmin();

  const parsed = categoryInputSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  if (!hasDatabase()) {
    console.log("Offline simulation: Category created", data);
    return { success: true, message: "Database offline. Simulated category creation." };
  }

  try {
    const id = `cat_${Math.random().toString(36).substring(2, 11)}`;
    await db.insert(categories).values({
      id,
      name: data.name,
      slug: data.slug.toLowerCase(),
      description: data.description,
      image: data.image,
      isActive: data.isActive,
    });

    revalidatePath("/shop");
    revalidatePath("/admin/categories");
    return { success: true, id };
  } catch (error) {
    console.error("DB Create Category failed:", error);
    return { success: false, error: "Failed to create category." };
  }
}

export async function duplicateProductAction(id: string) {
  await requireAdmin();

  if (!hasDatabase()) {
    return { success: false, error: "Database offline. Cannot duplicate." };
  }

  try {
    const original = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        images: true,
        variants: true,
        options: {
          with: {
            values: true
          }
        }
      }
    });

    if (!original) {
      return { success: false, error: "Product not found to duplicate." };
    }

    const newProductId = `prod_${Math.random().toString(36).substring(2, 11)}`;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

    // 1. Insert product copy
    await db.insert(products).values({
      id: newProductId,
      categoryId: original.categoryId,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${randomSuffix.toLowerCase()}`,
      description: original.description,
      sku: `${original.sku}-COPY-${randomSuffix}`,
      pricePaise: original.pricePaise,
      compareAtPricePaise: original.compareAtPricePaise,
      fabric: original.fabric,
      color: original.color,
      length: original.length,
      neckline: original.neckline,
      sleeves: original.sleeves,
      occasion: original.occasion,
      washCare: original.washCare,
      featured: false,
      isActive: false, // Draft by default
      productNumber: original.productNumber ? original.productNumber + 1000 : null,
    });

    // 2. Duplicate images
    for (const img of original.images) {
      await db.insert(productImages).values({
        id: `img_${Math.random().toString(36).substring(2, 11)}`,
        productId: newProductId,
        url: img.url,
        imageUrl: img.imageUrl,
        publicId: img.publicId,
        alt: img.alt,
        altText: img.altText,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
        width: img.width,
        height: img.height,
      });
    }

    // 3. Duplicate variants
    for (const variant of original.variants) {
      await db.insert(productVariants).values({
        id: `var_${Math.random().toString(36).substring(2, 11)}`,
        productId: newProductId,
        sku: `${variant.sku}-COPY-${randomSuffix}`,
        name: variant.name,
        pricePaise: variant.pricePaise,
        compareAtPricePaise: variant.compareAtPricePaise,
        stock: variant.stock,
        inventoryQuantity: variant.inventoryQuantity,
        isActive: variant.isActive,
        isAvailable: variant.isAvailable,
      });
    }

    // 4. Duplicate options & option values
    const productOptionsSchema = (await import("@/db/schema/catalog")).productOptions;
    const productOptionValuesSchema = (await import("@/db/schema/catalog")).productOptionValues;

    for (const opt of original.options) {
      const newOptId = `opt_${Math.random().toString(36).substring(2, 11)}`;
      await db.insert(productOptionsSchema).values({
        id: newOptId,
        productId: newProductId,
        name: opt.name,
        sortOrder: opt.sortOrder,
      });

      for (const val of opt.values) {
        await db.insert(productOptionValuesSchema).values({
          id: `val_${Math.random().toString(36).substring(2, 11)}`,
          optionId: newOptId,
          value: val.value,
          sortOrder: val.sortOrder,
        });
      }
    }

    revalidatePath("/shop");
    revalidatePath("/admin/products");

    return { success: true, id: newProductId };
  } catch (error: any) {
    console.error("Duplicate product failed:", error);
    return { success: false, error: error.message || "Failed to duplicate product." };
  }
}

export async function deleteProductAction(id: string) {
  await requireAdmin();

  if (!hasDatabase()) {
    return { success: false, error: "Database offline. Cannot delete." };
  }

  try {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Delete product failed:", error);
    return { success: false, error: "Failed to delete product. It may be referenced by existing orders." };
  }
}

export async function updateProductVariantAction(
  variantId: string,
  data: { stock: number; isAvailable: boolean; sku: string; inventoryQuantity: number }
) {
  await requireAdmin();
  if (!hasDatabase()) return { success: true };

  try {
    await db
      .update(productVariants)
      .set({
        stock: data.stock,
        inventoryQuantity: data.inventoryQuantity,
        isAvailable: data.isAvailable,
        sku: data.sku.toUpperCase(),
        updatedAt: new Date(),
      })
      .where(eq(productVariants.id, variantId));

    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Update variant failed:", error);
    return { success: false, error: "Failed to update variant." };
  }
}

export async function createProductVariantAction(
  productId: string,
  data: { name: string; sku: string; stock: number; isAvailable: boolean; inventoryQuantity: number }
) {
  await requireAdmin();
  if (!hasDatabase()) return { success: true };

  try {
    const id = `var_${Math.random().toString(36).substring(2, 11)}`;
    await db.insert(productVariants).values({
      id,
      productId,
      sku: data.sku.toUpperCase(),
      name: data.name,
      stock: data.stock,
      inventoryQuantity: data.inventoryQuantity,
      isAvailable: data.isAvailable,
    });

    revalidatePath("/shop");
    return { success: true, id };
  } catch (error: any) {
    console.error("Create variant failed:", error);
    return { success: false, error: "Failed to create variant." };
  }
}

export async function deleteProductVariantAction(variantId: string) {
  await requireAdmin();
  if (!hasDatabase()) return { success: true };

  try {
    await db.delete(productVariants).where(eq(productVariants.id, variantId));
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Delete variant failed:", error);
    return { success: false, error: "Failed to delete variant." };
  }
}

export async function createProductImageAction(
  productId: string,
  data: { url: string; altText: string; isPrimary: boolean; sortOrder: number }
) {
  await requireAdmin();
  if (!hasDatabase()) return { success: true };

  try {
    const id = `img_${Math.random().toString(36).substring(2, 11)}`;
    await db.insert(productImages).values({
      id,
      productId,
      url: data.url,
      imageUrl: data.url,
      alt: data.altText,
      altText: data.altText,
      isPrimary: data.isPrimary,
      sortOrder: data.sortOrder,
    });

    revalidatePath("/shop");
    return { success: true, id };
  } catch (error: any) {
    console.error("Create image failed:", error);
    return { success: false, error: "Failed to add image." };
  }
}

export async function deleteProductImageAction(imageId: string) {
  await requireAdmin();
  if (!hasDatabase()) return { success: true };

  try {
    await db.delete(productImages).where(eq(productImages.id, imageId));
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Delete image failed:", error);
    return { success: false, error: "Failed to delete image." };
  }
}

export async function reorderProductImagesAction(
  images: { id: string; sortOrder: number; isPrimary: boolean }[]
) {
  await requireAdmin();
  if (!hasDatabase()) return { success: true };

  try {
    for (const img of images) {
      await db
        .update(productImages)
        .set({
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })
        .where(eq(productImages.id, img.id));
    }

    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Reorder images failed:", error);
    return { success: false, error: "Failed to save image order." };
  }
}


