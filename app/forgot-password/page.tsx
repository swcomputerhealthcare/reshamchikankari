"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "https://www.reshamchikankari.com";
      const redirectTo = `${origin}/auth/callback?next=/account/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message || "Unable to send password reset email.");
      } else {
        setMessage(
          `Password reset link sent to ${email}! Please check your inbox and spam folder.`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-10 bg-[#FFF9F4] border border-brand-black/5 shadow-xs">
      <div className="text-center mb-8">
        <span className="text-[9px] uppercase tracking-widest text-[#7C7A5A] font-bold block mb-2">
          Account Recovery
        </span>
        <h1 className="font-display text-3xl text-brand-black mb-2 font-light">Forgot Password</h1>
        <p className="font-sans text-xs text-neutral-500 tracking-wide">
          Enter your registered email address to receive a password reset link
        </p>
      </div>

      {message && (
        <div className="bg-[#7C7A5A]/10 text-[#5C5A3A] text-xs p-3 mb-6 border border-[#7C7A5A]/20 font-sans tracking-wide">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-[#E694AA]/10 text-red-700 text-xs p-3 mb-6 border border-[#E694AA]/20 font-sans tracking-wide">
          {error}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="reset-email" className="block font-sans text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
            Email Address
          </label>
          <input
            id="reset-email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#FFF9F4] border border-brand-black/10 focus:border-[#7C7A5A] focus:outline-none text-base font-sans text-brand-black transition-colors rounded-none"
            placeholder="name@example.com"
          />
        </div>

        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 !bg-brand-black hover:!bg-neutral-800 text-brand-offwhite text-xs uppercase tracking-widest font-bold font-sans !rounded-none transition-colors"
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>
      </form>

      <div className="mt-8 text-center border-t border-brand-black/5 pt-6">
        <Link
          href="/login"
          className="font-sans text-xs text-brand-black hover:underline tracking-wide font-medium"
        >
          &larr; Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F4] grid grid-cols-1 lg:grid-cols-12 text-brand-black selection:bg-[#E694AA]/20">
      <div className="hidden lg:block lg:col-span-7 relative h-[calc(100vh-2rem)] min-h-[600px] rounded-[24px] overflow-hidden m-4 shadow-xs">
        <Image
          src="/images/reshamchikankari/New folder 5/IMG_2755.JPG"
          alt="Resham Chikankari Heritage"
          fill
          priority
          className="object-cover"
          sizes="60vw"
        />
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
          </div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-center px-4 py-16 bg-[#FFF9F4]">
        <div className="lg:hidden mb-8">
          <Link href="/" className="font-display text-2xl tracking-wider select-none text-brand-black hover:opacity-90">
            Resham Chikankari
          </Link>
        </div>
        
        <Suspense fallback={
          <div className="bg-[#FFF9F4] border border-brand-black/5 p-8 text-center font-sans text-xs text-neutral-500">
            Loading...
          </div>
        }>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
