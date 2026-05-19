import Link from "next/link";
import { Heart, Search, User } from "lucide-react";
import { Button } from "@/ui/button";
import { IconButton } from "@/ui/icon-button";
import { topNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <div className="container flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-display text-h3 text-text">
          <span className="inline-block h-6 w-6 rounded-full bg-brand-500" aria-hidden />
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {topNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-body text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" className="hidden md:inline-flex" asChild>
            <Link href="/search">
              <Search size={16} />
              <span className="text-text-muted">Tìm địa điểm…</span>
            </Link>
          </Button>
          <ThemeToggle />
          <IconButton label="Đã lưu" variant="ghost" asChild>
            <Link href="/saved">
              <Heart size={18} />
            </Link>
          </IconButton>
          <IconButton label="Tài khoản" variant="ghost" asChild>
            <Link href="/me">
              <User size={18} />
            </Link>
          </IconButton>
        </div>
      </div>
    </header>
  );
}
