"use client";
import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-colors duration-fast ease-standard " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-bg disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        ghost: "text-text hover:bg-surface-2",
        glass: "glass text-text hover:bg-white/10 dark:hover:bg-white/5",
        solid: "bg-surface text-text border border-border shadow-sm hover:bg-surface-2",
      },
      size: { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  label: string;
  asChild?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, variant, size, label, asChild, children, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      aria-label={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
});
