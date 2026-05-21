"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Menu } from "lucide-react";
import { SavedHeartButton } from "./SavedHeartButton";
import { UserAvatarButton } from "./UserAvatarButton";
import { cn } from "@/lib/cn";
import { spring, transition } from "@/lib/motion";
import { IconButton } from "@/ui/icon-button";
import { Button } from "@/ui/button";
import { topNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function FloatingNavbar() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    setCompact(v > 24);
  });

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <m.header
      initial={false}
      animate={{
        paddingTop: compact ? 8 : 16,
        paddingBottom: compact ? 8 : 16,
      }}
      transition={transition.base}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4"
    >
      <m.nav
        initial={false}
        animate={{
          maxWidth: compact ? 1200 : 1300,
        }}
        transition={spring.default}
        className={cn(
          "pointer-events-auto mx-auto flex items-center gap-2.5 rounded-full transition-all duration-300",
          "bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl border border-white/50 dark:border-white/5",
          "shadow-[0_12px_40px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)]",
          "ring-1 ring-black/[0.03] dark:ring-white/[0.02] liquid-glass-card",
          compact ? "h-12 px-2 shadow-md" : "h-16 px-4"
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-2 py-1.5 font-display text-[18px] font-bold tracking-tight text-black dark:text-white sm:px-3 transition-transform duration-300 hover:scale-[1.02]"
        >
          <img src="/images/mapVN.png" alt="logo" width={40} height={40} className="object-contain" />

          <span className="hidden sm:inline font-extrabold bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 dark:from-white dark:via-zinc-100 dark:to-zinc-200 bg-clip-text text-transparent">{siteConfig.name}</span>
        </Link>

        <ul className="ml-4 hidden items-center gap-1 lg:flex">
          {topNav.map((item) => {
            const active = pathname.startsWith(item.href) && item.href !== "/";
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative whitespace-nowrap rounded-full px-4 py-2 text-body font-medium transition-colors duration-200",
                    active
                      ? "text-brand-500 font-bold dark:text-white"
                      : "text-zinc-800 dark:text-zinc-300 hover:text-brand-500 dark:hover:text-white"
                  )}
                >
                  {active && (
                    <m.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/30 dark:border-zinc-700/30 shadow-[inset_0_1.5px_1px_rgba(0,0,0,0.02)]"
                      transition={spring.snappy}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {/* Inline search pill — only on xl+ where there's room */}
          <Link
            href="/search"
            className={cn(
              "group hidden xl:inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-body-sm transition-all duration-300 ease-out",
              "bg-zinc-50/90 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/45 text-zinc-500 dark:text-zinc-400 shadow-[inset_0_1.5px_1px_rgba(0,0,0,0.02)]",
              "hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300/80 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white liquid-glass-card",
              "hover:shadow-[0_6px_16px_-4px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.02),inset_0_1.5px_1px_rgba(255,255,255,0.85)] hover:scale-[1.01]"
            )}
          >
            <Search size={14} className="text-zinc-700 dark:text-zinc-500 transition-colors duration-300 group-hover:text-brand-500 group-hover:scale-105" />
            <span className="font-semibold tracking-wide text-[13px] transition-all duration-300 group-hover:translate-x-0.5">
              Tìm địa điểm…
            </span>
            <kbd className="ml-2.5 inline-flex h-5 w-5 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-sans text-[10px] font-bold text-zinc-400 dark:text-zinc-500 shadow-[0_1px_1.5px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900">
              /
            </kbd>
          </Link>

          {/* Search icon button on md-lg */}
          <IconButton
            label="Tìm kiếm"
            variant="ghost"
            asChild
            className="hidden md:inline-flex xl:hidden text-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white"
          >
            <Link href="/search">
              <Search size={18} />
            </Link>
          </IconButton>

          <ThemeToggle />
          <SavedHeartButton className="hidden sm:inline-flex text-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white" />
          <UserAvatarButton className="hidden sm:inline-flex" />

          <Button size="sm" className="hidden xl:inline-flex bg-brand-500 hover:bg-brand-600 active:scale-[0.96] transition-all duration-300 shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 font-semibold" asChild>
            <Link href="/submit" className="whitespace-nowrap">
              Đóng góp địa điểm
            </Link>
          </Button>

          <IconButton
            label="Menu"
            variant="ghost"
            className="lg:hidden text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu size={18} />
          </IconButton>
        </div>
      </m.nav>

      {mobileOpen && (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={transition.fast}
          className="pointer-events-auto mx-auto mt-2 max-w-[880px] rounded-2xl glass p-3 shadow-lg md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {topNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex rounded-lg px-3 py-3 text-body text-text hover:bg-surface-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </m.div>
      )}
    </m.header>
  );
}
