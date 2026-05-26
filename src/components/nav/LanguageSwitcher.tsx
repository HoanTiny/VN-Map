"use client";
import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: (typeof routing.locales)[number]) => {
    if (next === locale) return;
    startTransition(() => {
      // pathname here is already locale-stripped; router.replace re-applies the prefix.
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-zinc-200/70 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/40 p-0.5 text-[11px] font-bold",
        isPending && "opacity-60",
        className,
      )}
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            onClick={() => switchTo(l)}
            aria-pressed={active}
            disabled={isPending}
            className={cn(
              "rounded-full px-2 py-1 uppercase tracking-wide transition-colors duration-200",
              active
                ? "bg-brand-500 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white",
            )}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
