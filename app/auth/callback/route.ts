import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Validate redirect destination
      const origin = request.nextUrl.origin;
      let redirectUrl = new URL("/", origin);

      if (next.startsWith("/")) {
        redirectUrl = new URL(next, origin);
      } else {
        try {
          const parsedNext = new URL(next);
          if (parsedNext.origin === origin) {
            redirectUrl = parsedNext;
          }
        } catch {
          // Fallback to default
        }
      }

      // Open redirect protection: restrict paths to internal ecommerce pages
      const allowedPaths = ["/account", "/orders", "/wishlist", "/checkout"];
      const isAllowed =
        redirectUrl.pathname === "/" ||
        allowedPaths.some((p) => redirectUrl.pathname.startsWith(p));

      if (!isAllowed) {
        redirectUrl = new URL("/", origin);
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Diagnostic log for OAuth callback failures (safe error logging on server side)
  console.error("Supabase OAuth code exchange failed or missing code.");

  // Redirect to login page with a safe generic user message
  return NextResponse.redirect(
    new URL(
      "/login?error=Unable to sign in with Google. Please try again.",
      request.nextUrl.origin,
    ),
  );
}
