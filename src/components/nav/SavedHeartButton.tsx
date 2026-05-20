"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { IconButton } from "@/ui/icon-button";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { transition } from "@/lib/motion";

export interface SavedHeartButtonProps {
  className?: string;
}

/**
 * Navbar heart icon with a count badge that reflects the current saved list.
 * Hydration-safe — badge appears after client-side mount.
 */
export function SavedHeartButton({ className }: SavedHeartButtonProps) {
  const { saved, hydrated } = useSaved();
  const count = saved.length;

  return (
    <IconButton label="Đã lưu" variant="ghost" asChild className={className}>
      <Link href="/saved" className="relative">
        <Heart size={18} />
        <AnimatePresence>
          {hydrated && count > 0 && (
            <m.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={transition.fast}
              className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold leading-none text-white shadow-sm"
            >
              {count > 99 ? "99+" : count}
            </m.span>
          )}
        </AnimatePresence>
      </Link>
    </IconButton>
  );
}
