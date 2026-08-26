import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-brand-offwhite text-brand-black px-4">
      <Container className="max-w-md text-center py-16">
        <span className="font-sans text-xs tracking-widest text-brand-pink uppercase font-semibold mb-2 block">
          Access Denied
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-brand-black mb-6 leading-tight">
          Unauthorized Access
        </h1>
        <p className="font-sans text-sm text-neutral-600 leading-relaxed mb-8">
          You do not have the required permissions to view this resource. 
          If you believe this is an error, please log in with an administrator account.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button variant="primary" size="md">
              Log In
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="md">
              Back to Shop
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
