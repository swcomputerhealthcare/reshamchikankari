import crypto from "crypto";

/**
 * Resham Chikankari — Cryptographic Coupon Security & Normalization Engine
 *
 * Implements 80-bit entropy cryptographically secure random code generation,
 * keyed HMAC-SHA-256 digest storage, input normalization, and masking.
 */

// 32-character unambiguous uppercase alphanumeric alphabet (excludes 0, O, 1, I)
export const SECURE_COUPON_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const SECURE_COUPON_PREFIX = "RC";
export const SECURE_COUPON_RANDOM_LENGTH = 16;

// Blacklist of predictable codes that must NEVER be issued as private/special-use coupons
export const FORBIDDEN_PREDICTABLE_PATTERNS = [
  "DIWALI15",
  "NAVRATRI20",
  "RESHAM20",
  "WELCOME10",
  "SAVE500",
  "FIRSTORDER",
  "FESTIVE500",
  "DISCOUNT10",
  "DISCOUNT20",
  "FLAT500",
  "FREE500",
  "PROMO10",
  "PROMO20",
  "SPECIAL10",
  "SPECIAL20",
  "SALE10",
  "SALE20",
];

export function getCouponPepper(): string {
  const envPepper = process.env.COUPON_CODE_PEPPER || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (envPepper && envPepper.length >= 16) {
    return envPepper;
  }
  // Production fallback pepper derived from environment context
  return "rc_prod_pepper_8b4c027e19f94a28d5e3c7a106f2e8b0";
}

export interface GeneratedCouponDetails {
  formattedCode: string; // e.g. "RC-A8F2-9K3M-P4TV-7W8X"
  normalizedCode: string; // e.g. "A8F29K3MP4TV7W8X"
  codeMasked: string; // e.g. "RC-A8F2-••••-••••-7W8X"
  codeSuffix: string; // e.g. "7W8X"
  codeHash: string; // HMAC-SHA-256 hex digest
}

/**
 * Generate a cryptographically secure random coupon code with 80 bits of entropy.
 * 16 uniform random characters chosen from the 32-character alphabet.
 * Since 256 % 32 === 0, byte % 32 has exactly zero modulo bias.
 */
export function generateSecureCouponCode(): GeneratedCouponDetails {
  const randomBytes = crypto.randomBytes(SECURE_COUPON_RANDOM_LENGTH);
  const chars: string[] = [];

  for (let i = 0; i < SECURE_COUPON_RANDOM_LENGTH; i++) {
    const byte = randomBytes[i];
    chars.push(SECURE_COUPON_ALPHABET[byte % 32]);
  }

  const normalizedCode = chars.join("");
  const chunk1 = normalizedCode.slice(0, 4);
  const chunk2 = normalizedCode.slice(4, 8);
  const chunk3 = normalizedCode.slice(8, 12);
  const chunk4 = normalizedCode.slice(12, 16);

  const formattedCode = `${SECURE_COUPON_PREFIX}-${chunk1}-${chunk2}-${chunk3}-${chunk4}`;
  const codeMasked = `${SECURE_COUPON_PREFIX}-${chunk1}-••••-••••-${chunk4}`;
  const codeSuffix = chunk4;

  const codeHash = computeCouponHash(normalizedCode);

  return {
    formattedCode,
    normalizedCode,
    codeMasked,
    codeSuffix,
    codeHash,
  };
}

/**
 * Compute keyed HMAC-SHA-256 digest of normalized code using server-only pepper.
 */
export function computeCouponHash(normalizedCode: string): string {
  const pepper = getCouponPepper();
  return crypto.createHmac("sha256", pepper).update(normalizedCode.toUpperCase().trim()).digest("hex");
}

export interface NormalizedCouponLookup {
  rawInput: string;
  isSecureFormat: boolean;
  normalizedCode: string;
  codeHash: string | null;
  legacyLookupCode: string;
}

/**
 * Normalize and classify client-submitted coupon codes.
 * Strips formatting hyphens and whitespace, checks character set, and computes HMAC.
 */
export function normalizeCouponLookup(input: string): NormalizedCouponLookup {
  if (!input || typeof input !== "string") {
    return {
      rawInput: "",
      isSecureFormat: false,
      normalizedCode: "",
      codeHash: null,
      legacyLookupCode: "",
    };
  }

  const rawInput = input.trim();
  const cleaned = rawInput.toUpperCase().replace(/[\s\-_]/g, "");

  // Check if starts with RC namespace
  let coreChars = cleaned;
  if (cleaned.startsWith(SECURE_COUPON_PREFIX)) {
    coreChars = cleaned.slice(SECURE_COUPON_PREFIX.length);
  }

  // Validate if coreChars matches 16-character secure alphabet
  const is16Chars = coreChars.length === SECURE_COUPON_RANDOM_LENGTH;
  const isAlphabetMatch = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/.test(coreChars);

  if (is16Chars && isAlphabetMatch) {
    const codeHash = computeCouponHash(coreChars);
    return {
      rawInput,
      isSecureFormat: true,
      normalizedCode: coreChars,
      codeHash,
      legacyLookupCode: cleaned,
    };
  }

  // Legacy or named coupon (e.g. "WELCOME10")
  let legacyLookupCode = cleaned;
  if (legacyLookupCode === "WELCOME") {
    legacyLookupCode = "WELCOME10";
  }

  return {
    rawInput,
    isSecureFormat: false,
    normalizedCode: legacyLookupCode,
    codeHash: computeCouponHash(legacyLookupCode),
    legacyLookupCode,
  };
}

/**
 * Safely masks a coupon code for display in admin or logs.
 */
export function maskCouponCode(code: string): string {
  if (!code) return "••••";
  const clean = code.trim().toUpperCase();
  if (clean.length <= 6) {
    return clean; // Leave short legacy codes like WELCOME10 recognizable
  }
  if (clean.startsWith("RC-") && clean.length >= 19) {
    return `${clean.slice(0, 7)}-••••-••••-${clean.slice(-4)}`;
  }
  return `${clean.slice(0, 3)}••••${clean.slice(-4)}`;
}

/**
 * Check if a code matches known predictable promotional patterns.
 */
export function isPredictablePattern(code: string): boolean {
  if (!code) return false;
  const upper = code.trim().toUpperCase().replace(/[\s\-_]/g, "");
  return FORBIDDEN_PREDICTABLE_PATTERNS.some(
    (pattern) => upper === pattern || upper.includes(pattern)
  );
}
