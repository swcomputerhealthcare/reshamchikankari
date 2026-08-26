'use client';

import React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand-black text-brand-offwhite hover:bg-neutral-800 border border-brand-black",
        primary: "bg-brand-black text-brand-offwhite hover:bg-neutral-800 border border-brand-black",
        secondary: "bg-brand-sage text-brand-offwhite hover:opacity-90 border border-brand-sage",
        accent: "bg-brand-pink text-brand-offwhite hover:opacity-90 border border-brand-pink",
        outline: "border border-brand-black text-brand-black bg-transparent hover:bg-brand-black hover:text-brand-offwhite",
        ghost: "bg-transparent text-brand-black hover:bg-neutral-100",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-1.5 px-6 py-3 tracking-widest uppercase text-[10px] sm:text-xs font-sans font-semibold",
        sm: "h-9 gap-1 px-4 py-2 tracking-widest uppercase text-[10px] sm:text-xs font-sans font-semibold",
        md: "h-11 gap-1.5 px-6 py-3 tracking-widest uppercase text-[10px] sm:text-xs font-sans font-semibold",
        lg: "h-14 gap-2 px-8 py-4 tracking-widest uppercase text-[10px] sm:text-xs font-sans font-semibold",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface CustomButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  isLoading = false,
  children,
  disabled,
  ...props
}: CustomButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className="w-full sm:w-auto inline-block"
    >
      <ButtonPrimitive
        data-slot="button"
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </ButtonPrimitive>
    </motion.div>
  )
}

export { Button, buttonVariants }
export default Button
