"use client";
import { m, type HTMLMotionProps } from "framer-motion";
import { duration, easing, viewportOnce, viewportAlways } from "@/lib/motion";

type Direction = "up" | "down" | "left" | "right" | "none";

export interface RevealProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate"> {
  /** Animation direction. Default: "up". */
  direction?: Direction;
  /** Travel distance in px. Default: 16. */
  distance?: number;
  /** Stagger delay (s). Use index * 0.04 for lists. */
  delay?: number;
  /** Trigger more than once when re-entering viewport. Default: false. */
  repeat?: boolean;
  /** Custom duration in seconds. Default: `slow` (0.36). */
  durationS?: number;
}

/**
 * Whole-element scroll reveal. Fades + translates from `direction` into place
 * when scrolled into view. Respect prefers-reduced-motion via the global CSS
 * override in globals.css.
 */
export function Reveal({
  direction = "up",
  distance = 16,
  delay = 0,
  repeat = false,
  durationS = duration.slow,
  children,
  ...rest
}: RevealProps) {
  const initialOffset = offsetForDirection(direction, distance);
  return (
    <m.div
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={repeat ? viewportAlways : viewportOnce}
      transition={{ duration: durationS, ease: easing.standard, delay }}
      {...rest}
    >
      {children}
    </m.div>
  );
}

function offsetForDirection(d: Direction, distance: number) {
  switch (d) {
    case "up":    return { y: distance };
    case "down":  return { y: -distance };
    case "left":  return { x: distance };
    case "right": return { x: -distance };
    default:      return {};
  }
}
