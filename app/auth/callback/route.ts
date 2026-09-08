import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  // Validate redirect destination (Open Redirect Protection)
  let redirectUrl = new URL("/account", origin);
  if (next.startsWith("/")) {
    redirectUrl = new URL(next, origin);
  } else {
    try {
      const parsed = new URL(next);
      if (parsed.origin === origin) {
        redirectUrl = parsed;
      }
    } catch {
      // Ignore URL parsing errors and fallback to /account
    }
  }

  const allowedPaths = [
    "/account",
    "/orders",
    "/wishlist",
    "/checkout",
    "/cart",
    "/shop",
    "/product",
  ];
  const isAllowed =
    redirectUrl.pathname === "/" ||
    allowedPaths.some((p) => redirectUrl.pathname.startsWith(p));

  if (!isAllowed) {
    redirectUrl = new URL("/account", origin);
  }

  if (!code) {
    console.warn("OAuth callback invoked without code parameter.");
    return NextResponse.redirect(
      new URL(
        "/login?error=" +
          encodeURIComponent("Unable to complete Google sign-in. Please try again."),
        origin
      )
    );
  }

  // Create redirect response early so session cookies can be attached to the response headers
  const response = NextResponse.redirect(redirectUrl);
  const cookieStore = await cookies();

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://woavdlhvmjikobigadqc.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_ADKS42lpLMQX__UratAPsg_8jhAD-ND";

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOpts = {
            ...options,
            path: options?.path ?? "/",
            sameSite: options?.sameSite ?? "lax",
            secure: process.env.NODE_ENV === "production",
          };
          try {
            cookieStore.set(name, value, cookieOpts);
          } catch {}
          try {
            response.cookies.set(name, value, cookieOpts);
          } catch {}
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback exchange failed:", error.message, error);
    return NextResponse.redirect(
      new URL(
        "/login?error=" +
          encodeURIComponent("Unable to complete Google sign-in. Please try again."),
        origin
      )
    );
  }

  return response;
}
