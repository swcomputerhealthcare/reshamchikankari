"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message || "Failed to sign up. Please try again.");
      } else {
        router.push("/login?message=Account created successfully! Please sign in.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] grid grid-cols-1 lg:grid-cols-12 text-brand-black selection:bg-[#E694AA]/20">
      {/* Editorial campaign panel (Hidden on mobile/tablet) */}
      <div className="hidden lg:block lg:col-span-7 relative h-[calc(100vh-2rem)] min-h-[600px] rounded-[24px] overflow-hidden m-4 shadow-xs">
        <Image
          src="/images/auth-campaign.jpg"
          alt="Editorial campaign presentation of Lucknowi Chikankari"
          fill
          priority
          quality={92}
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
               Lucknowi Atelier
            </span>
            <h2 className="font-display text-4xl text-white leading-tight font-light">
              Join Our <br />
              Community of <br />
              Artisan Lovers.
            </h2>
            <div className="w-12 h-[1px] bg-[#E694AA]"></div>
            <p className="font-sans text-xs text-white/80 leading-relaxed">
              Create an account with Resham to save your wishlist, view orders, and follow the journeys of our Lucknowi artisans.
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
        
        <div className="w-full max-w-md p-6 sm:p-10 bg-[#FFF9F4] border border-brand-black/5 shadow-xs">
          <div className="text-center mb-8">
            <span className="text-[9px] uppercase tracking-widest text-[#7C7A5A] font-bold block mb-2">
              Atelier Registration
            </span>
            <h1 className="font-display text-4xl text-brand-black mb-2 font-light">Create Account</h1>
            <p className="font-sans text-xs text-neutral-500 tracking-wide">
              Become part of the Resham family
            </p>
          </div>

          {error && (
            <div className="bg-[#E694AA]/10 text-red-700 text-xs p-3 mb-6 border border-[#E694AA]/20 font-sans tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="block font-sans text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#FFF9F4] border border-brand-black/10 focus:border-[#7C7A5A] focus:outline-none text-base font-sans text-brand-black transition-colors rounded-none"
                placeholder="Namrata Singh"
              />
            </div>

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
                className="w-full px-4 py-3 bg-[#FFF9F4] border border-brand-black/10 focus:border-[#7C7A5A] focus:outline-none text-base font-sans text-brand-black transition-colors rounded-none"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block font-sans text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#FFF9F4] border border-brand-black/10 focus:border-[#7C7A5A] focus:outline-none text-base font-sans text-brand-black transition-colors rounded-none"
                placeholder="••••••••"
              />
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-full py-3.5 !bg-brand-black hover:!bg-neutral-800 text-brand-offwhite text-xs uppercase tracking-widest font-bold font-sans !rounded-none transition-colors mt-2"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-brand-black/5 pt-6">
            <p className="font-sans text-xs text-neutral-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-black hover:text-[#E694AA] transition-colors">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
