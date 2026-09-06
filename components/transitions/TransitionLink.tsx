'use client';

import React, { ReactNode, MouseEvent } from "react";
import Link from "next/link";

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function TransitionLink({
  href,
  children,
  className,
  onClick,
  ...props
}: TransitionLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={className}
      prefetch={true}
      {...props}
    >
      {children}
    </Link>
  );
}
