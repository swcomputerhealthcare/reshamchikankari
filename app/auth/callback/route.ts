import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  // Validate redirect destination
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
      // Ignore URL parsing errors
    }
  }

  // Open redirect protection: restrict paths to internal ecommerce pages
  const allowedPaths = ["/account", "/orders", "/wishlist", "/checkout", "/cart", "/shop", "/product", "/login"];
  const isAllowed =
    redirectUrl.pathname === "/" ||
    allowedPaths.some((p) => redirectUrl.pathname.startsWith(p));

  if (!isAllowed) {
    redirectUrl = new URL("/account", origin);
  }

  // Prepare redirect response so session cookies can be attached with Path=/
  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://woavdlhvmjikobigadqc.supabase.co";
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_ADKS42lpLMQX__UratAPsg_8jhAD-ND";

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            const reqCookies = request.cookies.getAll();
            const storeCookies = cookieStore.getAll();
            const map = new Map<string, any>();
            reqCookies.forEach((c) => map.set(c.name, c));
            storeCookies.forEach((c) => map.set(c.name, c));
            return Array.from(map.values());
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              const opts = {
                ...options,
                path: "/",
                sameSite: "lax" as const,
              };
              try { cookieStore.set(name, value, opts); } catch {}
              try { response.cookies.set(name, value, opts); } catch {}
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
    console.error("Supabase OAuth code exchange failed:", error.message);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message || "Unable to complete Google sign in. Please try again.")}`,
        origin
      )
    );
  }

  // If code exchange failed, redirect to login page with a descriptive message
  return NextResponse.redirect(
    new URL(
      "/login?error=Invalid auth callback code. Please try logging in again.",
      origin
    )
  );
}
