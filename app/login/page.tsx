"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Google button states: "idle" | "loading" | "redirecting" | "error"
  const [googleState, setGoogleState] = useState<"idle" | "loading" | "redirecting" | "error">("idle");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const successMessage = searchParams.get("message");
  const urlError = searchParams.get("error");
  const callbackURL = searchParams.get("callbackURL") || "/account";

  useEffect(() => {
    if (urlError) {
      setError(urlError);
    }
  }, [urlError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message?.toLowerCase().includes("email not confirmed")) {
          setError("Your email has not been confirmed yet. Please verify your email or confirm your user in the Supabase Dashboard.");
        } else {
          setError(authError.message || "Invalid email or password.");
        }
      } else {
        window.location.href = callbackURL;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleState("loading");

    try {
      const supabase = createClient();
      const redirectToUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackURL)}`;
      
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectToUrl,
        },
      });

      if (authError) {
        setGoogleState("error");
        setError("Unable to sign in with Google. Please try again.");
        console.error("Google OAuth Error: ", authError.message);
      } else {
        setGoogleState("redirecting");
      }
    } catch (err: unknown) {
      setGoogleState("error");
      const message = err instanceof Error ? err.message : "An unexpected error occurred during Google Sign In.";
      setError("Unable to sign in with Google. Please try again.");
      console.error("Google OAuth exception: ", message);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-10 bg-[#FFF9F4] border border-brand-black/5 shadow-xs">
      <div className="text-center mb-8">
        <span className="text-[9px] uppercase tracking-widest text-[#7C7A5A] font-bold block mb-2">
          Atelier Entrance
        </span>
        <h1 className="font-display text-4xl text-brand-black mb-2 font-light">Welcome Back</h1>
        <p className="font-sans text-xs text-neutral-500 tracking-wide">
          Sign in to your Resham account
        </p>
      </div>

      {successMessage && (
        <div className="bg-[#7C7A5A]/5 text-[#7C7A5A] text-xs p-3 mb-6 border border-[#7C7A5A]/15 font-sans tracking-wide">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-[#E694AA]/10 text-red-700 text-xs p-3 mb-6 border border-[#E694AA]/20 font-sans tracking-wide">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block font-sans text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || googleState !== "idle"}
            className="w-full px-4 py-3 bg-[#FFF9F4] border border-brand-black/10 focus:border-[#7C7A5A] focus:outline-none text-base font-sans text-brand-black transition-colors rounded-none"
            placeholder="name@example.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block font-sans text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="font-sans text-[10px] text-neutral-500 hover:text-brand-black transition-colors tracking-wide"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || googleState !== "idle"}
            className="w-full px-4 py-3 bg-[#FFF9F4] border border-brand-black/10 focus:border-[#7C7A5A] focus:outline-none text-base font-sans text-brand-black transition-colors rounded-none"
            placeholder="••••••••"
          />
        </div>

        <Button
          variant="primary"
          type="submit"
          disabled={isLoading || googleState !== "idle"}
          className="w-full py-3.5 !bg-brand-black hover:!bg-neutral-800 text-brand-offwhite text-xs uppercase tracking-widest font-bold font-sans !rounded-none transition-colors mt-2"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="relative my-8 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-brand-black/5"></div>
        </div>
        <span className="relative px-4 bg-[#FFF9F4] text-[10px] text-neutral-400 uppercase tracking-widest font-medium font-sans">
          or
        </span>
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading || googleState !== "idle"}
        className="w-full flex items-center justify-center px-4 py-3.5 border border-brand-black/10 hover:border-brand-black bg-[#FFF9F4] text-brand-black text-xs uppercase tracking-widest font-bold font-sans transition-colors cursor-pointer disabled:opacity-50 select-none"
      >
        {googleState === "loading" ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-brand-black" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Connecting to Google...
          </span>
        ) : googleState === "redirecting" ? (
          "Redirecting to Google..."
        ) : (
          <>
            {/* Colored Official Google 'G' Logo */}
            <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      <div className="mt-8 text-center border-t border-brand-black/5 pt-6">
        <p className="font-sans text-xs text-neutral-600">
          New to Resham Chikankari?{" "}
          <Link href="/signup" className="font-semibold text-brand-black hover:text-[#E694AA] transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F4] grid grid-cols-1 lg:grid-cols-12 text-brand-black selection:bg-[#E694AA]/20">
      {/* Editorial campaign panel (Hidden on mobile/tablet) */}
      <div className="hidden lg:block lg:col-span-7 relative h-[calc(100vh-2rem)] min-h-[600px] rounded-[24px] overflow-hidden m-4 shadow-xs">
        <Image
          src="/images/reshamchikankari/New folder 5/IMG_2755.JPG"
          alt="Editorial campaign presentation of Lucknowi Chikankari"
          fill
          priority
          className="object-cover"
          sizes="60vw"
        />
        {/* Editorial Text Overlay */}
        <div className="absolute inset-0 bg-brand-black/10 flex flex-col justify-between p-16 text-brand-offwhite">
          <Link href="/" className="font-display text-2xl tracking-wider select-none text-white hover:opacity-90 w-fit">
            Resham Chikankari
          </Link>
          
          <div className="space-y-4 max-w-md text-left">
            <span className="text-[10px] font-sans font-bold tracking-widest text-[#E694AA] uppercase block">
              Lucknowi Heritage
            </span>
            <h2 className="font-display text-4xl text-white leading-tight font-light">
              Crafted with Care, <br />
              Worn with Grace.
            </h2>
            <div className="w-12 h-[1px] bg-[#E694AA]"></div>
            <p className="font-sans text-xs text-white/80 leading-relaxed">
              Every garment in our collection represents hours of intricate hand-embroidery by women artisans, keeping Lucknow&apos;s beautiful shadow-work craft alive.
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-center px-4 py-16 bg-[#FFF9F4]">
        <div className="lg:hidden mb-8">
          <Link href="/" className="font-display text-2xl tracking-wider select-none text-brand-black hover:opacity-90">
            Resham Chikankari
          </Link>
        </div>
        
        <Suspense fallback={
          <div className="bg-[#FFF9F4] border border-brand-black/5 p-8 sm:p-10 text-center font-sans text-xs text-neutral-500">
            Loading Entrance...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
