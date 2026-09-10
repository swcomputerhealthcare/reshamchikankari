import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (
    url.includes("[YOUR-PASSWORD]") ||
    url.includes("[YOUR-PROJECT-REF]") ||
    url.includes("YOUR-PROJECT-REF") ||
    url.includes("postgres.[YOUR-PROJECT-REF]")
  ) {
    return false;
  }
  return true;
}
