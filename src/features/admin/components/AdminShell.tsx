"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/places", label: "Địa điểm", icon: MapPin, exact: false },
  { href: "/admin/reviews", label: "Reviews", icon: Star, exact: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <div className="border-b border-border px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-body-sm font-medium text-text-muted hover:text-text">
            <ChevronRight size={14} className="rotate-180" />
            Về trang chủ
          </Link>
          <p className="mt-2 font-display text-h3 text-text">Admin</p>
        </div>
        <nav className="flex-1 space-y-0.5 p-2 pt-3">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-text-muted hover:bg-surface-2 hover:text-text"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top strip */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center gap-1 border-b border-border bg-surface px-3 py-2 md:hidden">
        <Link href="/" className="p-2 text-text-muted hover:text-text">
          <ChevronRight size={16} className="rotate-180" />
        </Link>
        <span className="font-display text-h3 text-text">Admin</span>
        <div className="ml-auto flex gap-1">
          {NAV.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-3 py-1 text-caption font-medium",
                  active ? "bg-brand-50 text-brand-700" : "text-text-muted hover:bg-surface-2"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6 pt-16 md:pt-6">{children}</main>
    </div>
  );
}
