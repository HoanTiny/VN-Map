/**
 * Map-VN motion design tokens.
 *
 * One source of truth for every Framer Motion animation in the app.
 * Map every UI motion to one of these tokens — never inline ad-hoc numbers
 * in components. Numbers here mirror the values in
 * PRODUCT_AND_DESIGN_SYSTEM.md §12 and MOTION_GUIDELINES.md.
 */

import type { Transition, Variants } from "framer-motion";

/* ----------------------------------- Durations ----------------------------------- */
// All durations in seconds (Framer Motion convention).
export const duration = {
  instant: 0.08,
  fast: 0.16,
  base: 0.24,
  slow: 0.36,
  slower: 0.56,
} as const;
export type DurationKey = keyof typeof duration;

/* ------------------------------------ Easings ------------------------------------ */
// Cubic-bezier curves matching CSS tokens for parity with non-Motion code.
export const easing = {
  /** Default — almost everything UI. */
  standard: [0.2, 0, 0, 1] as const,
  /** Acceleration only — for elements leaving the screen. */
  exit: [0.4, 0, 1, 1] as const,
  /** Decelerated — for elements entering the screen. */
  enter: [0, 0, 0, 1] as const,
} as const;

/* ----------------------------------- Springs ----------------------------------- */
// Use springs for anything that responds to direct user gesture (drag, sheet
// snap, marker bounce). Linear-time `duration` for everything else.
export const spring = {
  /** Default UI spring — sheets, modals, markers, layout shifts. */
  default: { type: "spring", stiffness: 380, damping: 32, mass: 1 } satisfies Transition,
  /** Snappy — buttons, taps, toggle states. */
  snappy: { type: "spring", stiffness: 500, damping: 30, mass: 0.8 } satisfies Transition,
  /** Gentle — large reveals, hero entrances. */
  gentle: { type: "spring", stiffness: 220, damping: 28, mass: 1 } satisfies Transition,
  /** Bouncy — celebratory, use sparingly (saved!, success!). */
  bouncy: { type: "spring", stiffness: 360, damping: 18, mass: 0.9 } satisfies Transition,
} as const;
export type SpringKey = keyof typeof spring;

/* ---------------------------------- Transitions ---------------------------------- */
export const transition = {
  fast: { duration: duration.fast, ease: easing.standard } satisfies Transition,
  base: { duration: duration.base, ease: easing.standard } satisfies Transition,
  slow: { duration: duration.slow, ease: easing.standard } satisfies Transition,
  exit: { duration: duration.fast, ease: easing.exit } satisfies Transition,
  enter: { duration: duration.base, ease: easing.enter } satisfies Transition,
} as const;

/* ------------------------------------ Variants ----------------------------------- */
/* Common reveal patterns. Apply via `variants={fadeUp}` + `initial="initial"
   animate="animate" exit="exit"` on a m.div. */

export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transition.base },
  exit: { opacity: 0, transition: transition.exit },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.standard } },
  exit: { opacity: 0, y: 8, transition: transition.exit },
};

export const fadeDown: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: transition.slow },
  exit: { opacity: 0, y: -8, transition: transition.exit },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: spring.default },
  exit: { opacity: 0, scale: 0.98, transition: transition.exit },
};

export const slideUp: Variants = {
  initial: { y: "100%" },
  animate: { y: 0, transition: spring.default },
  exit: { y: "100%", transition: transition.exit },
};

export const slideDown: Variants = {
  initial: { y: "-100%" },
  animate: { y: 0, transition: spring.default },
  exit: { y: "-100%", transition: transition.exit },
};

/* Sheet / dialog entrance for floating cards over map. */
export const floatingCard: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: spring.default },
  exit: { opacity: 0, y: 24, scale: 0.98, transition: transition.exit },
};

/* ----------------------------------- Stagger ----------------------------------- */
export const stagger = {
  fast: 0.03,
  base: 0.04,
  slow: 0.06,
} as const;

export const staggerParent = (delay: number = stagger.base): Variants => ({
  animate: { transition: { staggerChildren: delay, delayChildren: 0.02 } },
  exit: { transition: { staggerChildren: delay * 0.5, staggerDirection: -1 } },
});

/* ------------------------------- Hover / press ------------------------------- */
/* Wrap with whileHover / whileTap on m.div. */
export const hoverLift = { y: -2, transition: spring.snappy } as const;
export const hoverScale = { scale: 1.03, transition: spring.snappy } as const;
export const pressScale = { scale: 0.97, transition: { duration: duration.instant } } as const;

/* ----------------------- Viewport (whileInView) defaults ----------------------- */
export const viewportOnce = { once: true, margin: "-80px" } as const;
export const viewportAlways = { once: false, margin: "-40px" } as const;

/* ----------------------------------- Helpers ----------------------------------- */
export function withDelay<T extends Transition>(t: T, delay: number): T {
  return { ...t, delay };
}

/** Build a `whileInView` config with sane Map-VN defaults. */
export const inViewReveal = {
  initial: "initial",
  whileInView: "animate",
  viewport: viewportOnce,
} as const;
