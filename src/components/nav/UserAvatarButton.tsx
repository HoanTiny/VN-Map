"use client";
import Link from "next/link";
import { User } from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { IconButton } from "@/ui/icon-button";

export interface UserAvatarButtonProps {
  className?: string;
}

/**
 * Navbar account icon. Shows a generic User icon when signed-out, or a
 * 1-letter colored avatar when signed-in. Always links to /me.
 */
export function UserAvatarButton({ className }: UserAvatarButtonProps) {
  const { user, hydrated } = useSession();

  // Pre-hydration: render the generic icon to avoid a flash from "signed-in"
  // visual to "signed-out" if the user's session is stale.
  if (!hydrated || !user) {
    return (
      <IconButton label="Tài khoản" variant="ghost" asChild className={className}>
        <Link href={user ? "/me" : "/sign-in"}>
          <User size={18} />
        </Link>
      </IconButton>
    );
  }

  const initial = (user.email?.[0] ?? "?").toUpperCase();
  return (
    <Link
      href="/me"
      aria-label="Tài khoản"
      className={
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 font-display text-body font-semibold text-brand-700 transition-colors hover:bg-brand-100 " +
        (className ?? "")
      }
    >
      {initial}
    </Link>
  );
}
