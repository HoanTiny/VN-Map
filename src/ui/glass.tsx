import { cn } from "@/lib/cn";

type GlassVariant = "subtle" | "default" | "strong";

export function Glass({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: GlassVariant }) {
  const cls =
    variant === "subtle" ? "glass-subtle" : variant === "strong" ? "glass-strong" : "glass";
  return <div className={cn(cls, "rounded-2xl", className)} {...props} />;
}
