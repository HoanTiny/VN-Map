import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const cardVariants = cva("bg-surface text-text", {
  variants: {
    tier: {
      // Tier A — Place card (Airbnb)
      place:
        "rounded-xl shadow-sm transition-[transform,box-shadow] duration-base ease-standard " +
        "hover:-translate-y-0.5 hover:shadow-md border border-border dark:border-transparent",
      // Tier B — Info panel (Notion)
      panel: "rounded-lg border border-border",
      // Tier C — Floating map card (Apple Maps glass)
      floating: "glass rounded-2xl shadow-lg",
    },
  },
  defaultVariants: { tier: "place" },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, tier, ...props },
  ref
) {
  return <div ref={ref} className={cn(cardVariants({ tier }), className)} {...props} />;
});

export function CardMedia({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-hidden rounded-lg", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 md:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-h3", className)} {...props} />;
}

export function CardMeta({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-body-sm text-text-muted flex items-center gap-2", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5 md:px-6 md:pb-6", className)} {...props} />;
}
