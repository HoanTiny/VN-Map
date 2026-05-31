import Link from "next/link";
import Image from "next/image";
import { Heart, Search, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/ui/button";
import { IconButton } from "@/ui/icon-button";
import { topNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export async function TopBar() {
  const t = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <div className="container flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-display text-h3 text-text">
          <Image src="/images/mapVN.png" alt="logo" width={32} height={32} priority />
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {topNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-body text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" className="hidden md:inline-flex" asChild>
            <Link href="/search">
              <Search size={16} />
              <span className="text-text-muted">{tCommon("searchPlaces")}</span>
            </Link>
          </Button>
          <ThemeToggle />
          <IconButton label={t("saved")} variant="ghost" asChild>
            <Link href="/saved">
              <Heart size={18} />
            </Link>
          </IconButton>
          <IconButton label={t("account")} variant="ghost" asChild>
            <Link href="/me">
              <User size={18} />
            </Link>
          </IconButton>
        </div>
      </div>
    </header>
  );
}
