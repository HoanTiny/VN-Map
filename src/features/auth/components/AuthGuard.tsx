"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { useSession } from "../hooks/useSession";

export interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * Behaviour when not signed-in:
   * - "redirect": auto-redirect to /sign-in?next=<current path>
   * - "prompt":   show an inline CTA card (default — gentler UX)
   */
  mode?: "redirect" | "prompt";
  /** Shown when in "prompt" mode and user is signed-out. */
  message?: string;
}

/**
 * Gate children behind a Supabase session. When backend isn't configured at all
 * (disabled), behaves as if signed-in — allows the localStorage-based flows
 * from Phase 1 to keep working.
 */
export function AuthGuard({
  children,
  mode = "prompt",
  message,
}: AuthGuardProps) {
  const t = useTranslations("AuthGuard");
  const resolvedMessage = message ?? t("defaultMessage");
  const { user, hydrated, disabled } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (mode !== "redirect") return;
    if (!hydrated || disabled || user) return;
    router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
  }, [mode, hydrated, disabled, user, router, pathname]);

  // No backend → bypass guard (Phase 1 localStorage mode).
  if (disabled) return <>{children}</>;

  // First render before getSession() resolves.
  if (!hydrated) {
    return (
      <div className="container max-w-3xl pt-32">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Signed-in: render protected content.
  if (user) return <>{children}</>;

  // Redirect mode renders nothing while navigating.
  if (mode === "redirect") return null;

  // Prompt mode: inline CTA.
  return (
    <div className="container max-w-2xl pt-32 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <LogIn size={20} />
      </div>
      <h1 className="mt-4 font-display text-display-lg text-text">{t("title")}</h1>
      <p className="mx-auto mt-2 max-w-md text-body-lg text-text-muted">{resolvedMessage}</p>
      <Button asChild className="mt-6">
        <Link href={`/sign-in?next=${encodeURIComponent(pathname)}`}>
          <LogIn size={16} /> {t("signInOneClick")}
        </Link>
      </Button>
    </div>
  );
}
