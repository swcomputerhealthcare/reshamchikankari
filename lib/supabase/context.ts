import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  verifyCredentials,
  createContextClient,
  createAdminClient,
} from "@supabase/server/core";
import type {
  AuthModeWithKey,
  SupabaseContext,
  SupabaseEnv,
  UserClaims,
} from "@supabase/server";

function resolveNextEnv(): Partial<SupabaseEnv> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://woavdlhvmjikobigadqc.supabase.co";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_ADKS42lpLMQX__UratAPsg_8jhAD-ND";
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  return {
    url,
    publishableKeys: publishableKey ? { default: publishableKey } : {},
    secretKeys: secretKey ? { default: secretKey } : {},
  };
}

let cachedJwks: SupabaseEnv["jwks"] = null;

async function getJwks(supabaseUrl: string): Promise<SupabaseEnv["jwks"]> {
  if (cachedJwks) return cachedJwks;
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
    if (!res.ok) return null;
    cachedJwks = await res.json();
    return cachedJwks;
  } catch {
    return null;
  }
}

export async function createSupabaseContext(
  options: { auth?: AuthModeWithKey | AuthModeWithKey[] } = { auth: "user" },
): Promise<
  { data: SupabaseContext; error: null } | { data: null; error: Error }
> {
  const nextEnv = resolveNextEnv();

  if (!nextEnv.url || !nextEnv.publishableKeys?.default) {
    return {
      data: null,
      error: new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY"),
    };
  }

  const cookieStore = await cookies();
  const ssrClient = createServerClient(
    nextEnv.url,
    nextEnv.publishableKeys.default,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components can't write cookies — middleware handles it.
          }
        },
      },
    },
  );

  const isUserAuth =
    options.auth === "user" ||
    (Array.isArray(options.auth) && options.auth.includes("user"));

  // For user auth from SSR cookie storage, authenticate via Supabase Auth directly.
  // This supports all signing algorithms (HS256 and ES256) seamlessly without asymmetric JWKS mismatch.
  if (isUserAuth) {
    try {
      const {
        data: { user },
        error: userError,
      } = await ssrClient.auth.getUser();

      if (user && !userError) {
        const userClaims: UserClaims = {
          id: user.id,
          email: user.email,
          role: user.role,
          appMetadata: user.app_metadata,
          userMetadata: user.user_metadata,
        };

        const {
          data: { session },
        } = await ssrClient.auth.getSession();
        const token = session?.access_token ?? "";

        let supabase: any = ssrClient;
        try {
          if (token) {
            supabase = createContextClient({
              auth: { token },
              env: nextEnv,
            });
          }
        } catch {
          supabase = ssrClient;
        }

        let supabaseAdmin: any = ssrClient;
        try {
          supabaseAdmin = createAdminClient({ env: nextEnv });
        } catch {
          supabaseAdmin = ssrClient;
        }

        return {
          data: {
            authMode: "user",
            userClaims,
            jwtClaims: user.app_metadata as any,
            supabase,
            supabaseAdmin,
          },
          error: null,
        };
      }

      // If user auth was explicitly requested and failed, return unauthorized error
      if (options.auth === "user") {
        return {
          data: null,
          error: userError || new Error("User session not found or expired"),
        };
      }
    } catch (e: any) {
      if (options.auth === "user") {
        return {
          data: null,
          error: e instanceof Error ? e : new Error("Failed to authenticate user"),
        };
      }
    }
  }

  // Fallback to token/secret key verification for service role or machine-to-machine calls
  const {
    data: { session },
  } = await ssrClient.auth.getSession();
  const token = session?.access_token ?? null;

  const jwks = await getJwks(nextEnv.url);
  const env: Partial<SupabaseEnv> = { ...nextEnv, jwks };

  const { data: auth, error } = await verifyCredentials(
    { token, apikey: null },
    { auth: options.auth ?? "user", env },
  );

  if (error) {
    return { data: null, error };
  }

  let supabase: any = ssrClient;
  try {
    supabase = createContextClient({
      auth: { token: auth!.token },
      env,
    });
  } catch {
    supabase = ssrClient;
  }

  let supabaseAdmin: any = ssrClient;
  try {
    supabaseAdmin = createAdminClient({ env });
  } catch {
    supabaseAdmin = ssrClient;
  }

  return {
    data: {
      supabase,
      supabaseAdmin,
      userClaims: auth!.userClaims,
      jwtClaims: auth!.jwtClaims,
      authMode: auth!.authMode,
    },
    error: null,
  };
}
