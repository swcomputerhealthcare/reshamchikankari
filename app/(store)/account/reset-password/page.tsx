"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Failed to reset password.");
      } else {
        setMessage("Password updated successfully! Redirecting to account...");
        setTimeout(() => {
          router.push("/account");
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="bg-[#FFF9F4] p-8 border border-brand-black/10 shadow-xs">
        <h1 className="font-display text-3xl text-brand-black mb-2 font-light text-center">Set New Password</h1>
        <p className="font-sans text-xs text-neutral-500 mb-6 text-center">
          Enter a new password for your Resham Chikankari account.
        </p>

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

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="new-password" className="block font-sans text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#FFF9F4] border border-brand-black/10 focus:border-[#7C7A5A] focus:outline-none text-base font-sans text-brand-black transition-colors rounded-none"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block font-sans text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#FFF9F4] border border-brand-black/10 focus:border-[#7C7A5A] focus:outline-none text-base font-sans text-brand-black transition-colors rounded-none"
              placeholder="••••••••"
            />
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 !bg-brand-black hover:!bg-neutral-800 text-brand-offwhite text-xs uppercase tracking-widest font-bold font-sans !rounded-none transition-colors"
            isLoading={isLoading}
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
