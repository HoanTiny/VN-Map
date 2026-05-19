"use client";
import { m, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { duration, easing } from "@/lib/motion";

/**
 * Wrap a route group's children in a quiet crossfade on path change. Per the
 * design system: never slide between top-level routes — crossfade only.
 *
 * Usage in a layout:
 *   <PageTransition>{children}</PageTransition>
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration.base, ease: easing.standard }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
