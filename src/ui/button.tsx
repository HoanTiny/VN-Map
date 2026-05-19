"use client";
import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-[background-color,box-shadow,transform,color] duration-fast ease-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
    "focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-brand-500 text-white rounded-full shadow-sm hover:bg-brand-600 hover:shadow-md",
        secondary:
          "bg-surface text-text border border-border rounded-lg hover:bg-surface-2",
        ghost: "text-text rounded-lg hover:bg-surface-2",
        tonal: "bg-brand-50 text-brand-700 rounded-full hover:bg-brand-100",
        destructive:
          "bg-danger text-white rounded-full shadow-sm hover:brightness-110 hover:shadow-md",
        glass: "glass text-text rounded-full hover:bg-white/10 dark:hover:bg-white/5",
        link: "text-brand-600 hover:underline underline-offset-4 px-0",
      },
      size: {
        sm: "h-8 px-4 text-[13px]",
        md: "h-10 px-5 text-[15px]",
        lg: "h-12 px-6 text-[15px]",
        xl: "h-14 px-7 text-[17px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, loading, children, disabled, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";
  const content = asChild ? (
    children
  ) : (
    <>
      {loading ? <Spinner size={size === "sm" ? 14 : 16} /> : null}
      {children}
    </>
  );
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </Comp>
  );
});

export { buttonVariants };
