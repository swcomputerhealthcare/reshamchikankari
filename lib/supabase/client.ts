import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client for Client Components.
 * Uses @supabase/ssr to store the PKCE code verifier and auth tokens in cookies.
 */
export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://woavdlhvmjikobigadqc.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_ADKS42lpLMQX__UratAPsg_8jhAD-ND";

  return createBrowserClient(url, key);
}
