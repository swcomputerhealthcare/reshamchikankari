import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Enforce HTTPS redirect in production
  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host");
  if (
    proto === "http" &&
    host &&
    !host.includes("localhost") &&
    !host.includes("127.0.0.1")
  ) {
    return NextResponse.redirect(
      `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`,
      301
    );
  }

  // If OAuth redirected to root / or any other route with ?code=, forward directly to /auth/callback to exchange for session
  const code = request.nextUrl.searchParams.get("code");
  if (code && !request.nextUrl.pathname.startsWith("/auth/callback")) {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.searchParams.set("code", code);
    const next = request.nextUrl.searchParams.get("next");
    if (next) {
      callbackUrl.searchParams.set("next", next);
    } else if (request.nextUrl.pathname && request.nextUrl.pathname !== "/") {
      callbackUrl.searchParams.set("next", request.nextUrl.pathname);
    }
    return NextResponse.redirect(callbackUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.nextUrl.pathname + request.nextUrl.search);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Skip auth session refresh on /auth/callback so we do not mutate or clear PKCE cookies before code exchange
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return supabaseResponse;
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://woavdlhvmjikobigadqc.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_ADKS42lpLMQX__UratAPsg_8jhAD-ND";

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              path: options?.path ?? "/",
              sameSite: options?.sameSite ?? "lax",
              secure: process.env.NODE_ENV === "production",
            })
          );
        },
      },
    });

    // Refresh auth session cookies if expired
    await supabase.auth.getUser();
  } catch (err) {
    console.warn("Proxy auth session refresh warning:", err);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - api/webhooks (third party webhooks like Razorpay, Shiprocket)
     * - api/cron (background cron jobs)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api/webhooks|api/cron).*)",
  ],
};
