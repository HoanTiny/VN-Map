"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, User, Menu } from "lucide-react";
import { SavedHeartButton } from "./SavedHeartButton";
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
          maxWidth: compact ? 1100 : 1200,
        }}
        transition={spring.default}
        className={cn(
          "pointer-events-auto mx-auto flex items-center gap-2 rounded-full",
          "glass shadow-lg ring-1 ring-black/[0.03] dark:ring-white/[0.04]",
          compact ? "h-12 px-2" : "h-16 px-3"
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-2 py-1.5 font-display text-h3 leading-none text-text sm:px-3"
        >
          <img src="/images/mapVN.png" alt="logo" width={42} height={42} />

          <span className="hidden sm:inline">{siteConfig.name}</span>
        </Link>

        <ul className="ml-2 hidden items-center gap-0.5 lg:flex">
          {topNav.map((item) => {
            const active = pathname.startsWith(item.href) && item.href !== "/";
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative whitespace-nowrap rounded-full px-3 py-2 text-body transition-colors",
                    active ? "text-text" : "text-black hover:text-text"
                  )}
                >
                  {active && (
                    <m.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-surface-2"
                      transition={spring.snappy}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {/* Inline search pill — only on xl+ where there's room */}
          <Link
            href="/search"
            className={cn(
              "group hidden xl:inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface/60 px-4 py-2 text-body-sm text-text-muted",
              "transition-colors hover:bg-surface"
            )}
          >
            <Search size={16} className="text-text-muted group-hover:text-brand-500" />
            <span>Tìm địa điểm…</span>
            <kbd className="ml-1 rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px]">
              /
            </kbd>
          </Link>

          {/* Search icon button on md-lg */}
          <IconButton
            label="Tìm kiếm"
            variant="ghost"
            asChild
            className="hidden md:inline-flex xl:hidden"
          >
            <Link href="/search">
              <Search size={18} />
            </Link>
          </IconButton>

          <ThemeToggle />
          <SavedHeartButton className="hidden sm:inline-flex" />
          <IconButton label="Tài khoản" variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/me">
              <User size={18} />
            </Link>
          </IconButton>

          <Button size="sm" className="hidden xl:inline-flex" asChild>
            <Link href="/submit" className="whitespace-nowrap">
              Đóng góp địa điểm
            </Link>
          </Button>

          <IconButton
            label="Menu"
            variant="ghost"
            className="lg:hidden"
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
