'use server';

import { requireAdmin } from "@/lib/auth/helpers";

export interface UploadResult {
  success: boolean;
  error?: string;
  image?: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
  };
}

export async function uploadAdminImageAction(formData: FormData): Promise<UploadResult> {
  // 1. Authorize Admin
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "No file provided for upload." };
  }

  // Validate mime type
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Uploaded file must be a valid image." };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const isCloudinaryConfigured =
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName !== "dummy" &&
    apiKey !== "dummy" &&
    apiSecret !== "dummy";

  if (isCloudinaryConfigured) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

      const timestamp = Math.floor(Date.now() / 1000);
      const crypto = await import("crypto");
      const signature = crypto
        .createHash("sha256")
        .update(`timestamp=${timestamp}${apiSecret}`)
        .digest("hex");

      const params = new URLSearchParams();
      params.append("file", base64Data);
      params.append("api_key", apiKey);
      params.append("timestamp", timestamp.toString());
      params.append("signature", signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: params,
      });

      const data = await res.json();
      if (res.ok && data.secure_url) {
        return {
          success: true,
          image: {
            url: data.secure_url,
            publicId: data.public_id || `raw_${Date.now()}`,
            width: data.width,
            height: data.height,
          },
        };
      } else {
        console.error("Cloudinary upload error:", data);
        return { success: false, error: data.error?.message || "Cloudinary upload failed." };
      }
    } catch (err: any) {
      console.error("Failed to stream image to Cloudinary:", err);
      return { success: false, error: err.message || "Failed to upload image to Cloudinary." };
    }
  }

  // Fallback: Convert to optimized Data URL if Cloudinary credentials are not present in current env
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    return {
      success: true,
      image: {
        url: dataUrl,
        publicId: `loc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      },
    };
  } catch (e: any) {
    return { success: false, error: "Failed to process image file." };
  }
}
