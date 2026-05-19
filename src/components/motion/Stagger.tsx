"use client";
import { m, type HTMLMotionProps, type Variants } from "framer-motion";
import {
  duration,
  easing,
  stagger,
  staggerParent,
  viewportOnce,
  viewportAlways,
} from "@/lib/motion";

export interface StaggerProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate"> {
  /** Gap between children animations (s). Default: 0.04. */
  gap?: number;
  /** Trigger more than once. */
  repeat?: boolean;
}

export interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate"> {
  /** Optional override of the child variant. */
  variants?: Variants;
  /** Distance for the default fade-up child. Default: 12. */
  distance?: number;
}

const defaultItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: easing.standard },
  },
};

/**
 * Container that staggers its <StaggerItem/> children's reveal when scrolled
 * into view. Use for card grids, lists, hero rows.
 */
export function Stagger({ gap = stagger.base, repeat, children, ...rest }: StaggerProps) {
  return (
    <m.div
      initial="initial"
      whileInView="animate"
      viewport={repeat ? viewportAlways : viewportOnce}
      variants={staggerParent(gap)}
      {...rest}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({
  variants = defaultItem,
  distance,
  children,
  ...rest
}: StaggerItemProps) {
  const v: Variants =
    distance != null
      ? {
          initial: { opacity: 0, y: distance },
          animate: {
            opacity: 1,
            y: 0,
            transition: { duration: duration.slow, ease: easing.standard },
          },
        }
      : variants;
  return (
    <m.div variants={v} {...rest}>
      {children}
    </m.div>
  );
}
