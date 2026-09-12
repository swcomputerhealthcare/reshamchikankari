import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client for Client Components.
 * Uses @supabase/ssr with cross-subdomain cookie scoping so PKCE code verifier
 * and session tokens are preserved across www.reshamchikankari.com and reshamchikankari.com.
 */
export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://woavdlhvmjikobigadqc.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_ADKS42lpLMQX__UratAPsg_8jhAD-ND";

  const isProdDomain =
    typeof window !== "undefined" &&
    window.location.hostname.endsWith("reshamchikankari.com");

  return createBrowserClient(url, key, {
    cookieOptions: isProdDomain
      ? {
          domain: ".reshamchikankari.com",
          path: "/",
          sameSite: "lax",
          secure: true,
        }
      : {
          path: "/",
          sameSite: "lax",
        },
  });
}
