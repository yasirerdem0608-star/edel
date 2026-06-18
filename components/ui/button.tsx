"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all ease-edel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white shadow-glow-primary hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:brightness-95",
        cta:
          "bg-gradient-cta text-white shadow-glow-accent hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-accent-soft text-accent border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)]",
        outline:
          "border border-border bg-surface text-fg hover:bg-surface-2",
        ghost: "text-fg-muted hover:text-fg hover:bg-surface-2",
        destructive:
          "bg-accent text-white hover:bg-accent-hover",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 text-sm rounded-xl",
        sm: "h-9 px-4 text-xs rounded-lg",
        lg: "h-12 px-6 text-base rounded-xl",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
