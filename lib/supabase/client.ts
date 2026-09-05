import { createBrowserClient } from "@supabase/ssr";

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
        }
      : {
          path: "/",
          sameSite: "lax",
        },
  });
}
