'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-offwhite text-brand-black px-4">
      <Container className="max-w-md text-center py-16">
        <span className="font-sans text-xs tracking-widest text-brand-pink uppercase font-semibold mb-2 block">
          System Error
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-brand-black mb-6 leading-tight">
          Something went wrong
        </h1>
        <p className="font-sans text-sm text-neutral-600 leading-relaxed mb-8">
          We encountered an unexpected error. Rest assured, our team has been notified. 
          Please try again or head back to the storefront.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="md" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="outline" size="md" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </div>
      </Container>
    </div>
  );
}
