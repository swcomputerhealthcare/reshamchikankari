import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://woavdlhvmjikobigadqc.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_ADKS42lpLMQX__UratAPsg_8jhAD-ND";

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
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
              }),
            );
          },
        },
      },
    );

    // Triggers refresh-token rotation and writes the new cookies via setAll.
    await supabase.auth.getUser();
  } catch (err) {
    // Prevent unhandled middleware exceptions from crashing the entire app with 500
    console.warn("Middleware proxy auth error:", err);
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
