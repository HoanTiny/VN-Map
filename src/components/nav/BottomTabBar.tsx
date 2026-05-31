"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { bottomTabs } from "@/config/nav";
import { useUIStore } from "@/stores/ui-store";

export function BottomTabBar() {
  const pathname = usePathname();
  const visible = useUIStore((s) => s.mobileNavVisible);
  const t = useTranslations("Nav");

  if (!visible) return null;

  return (
    <nav
      aria-label={t("map")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/90 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex h-16 items-stretch justify-around">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-caption transition-colors",
                  active ? "text-brand-500" : "text-text-muted hover:text-text"
                )}
              >
                <Icon size={20} />
                <span>{t(tab.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
