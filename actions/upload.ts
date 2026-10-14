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

  // 1. Enforce strict file size limit (max 10 MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "Image file exceeds maximum allowable size of 10 MB." };
  }

  // 2. Validate MIME type against strict raster image allowlist (disallowing active SVG content)
  const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
  ]);

  const mimeType = (file.type || "").toLowerCase().trim();
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      success: false,
      error: "Unsupported file type. Please upload a standard image file (JPEG, PNG, WebP, AVIF, or GIF).",
    };
  }

  // 3. Inspect binary magic bytes to prevent MIME spoofing
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
  const isWebp = buffer.length > 12 && buffer.toString("utf8", 0, 4) === "RIFF" && buffer.toString("utf8", 8, 12) === "WEBP";
  const isAvif = buffer.length > 12 && buffer.toString("utf8", 4, 12).includes("ftyp");

  if (!isJpeg && !isPng && !isGif && !isWebp && !isAvif) {
    return { success: false, error: "Invalid image content. File header does not match a recognized image format." };
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
      const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

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
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
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
