"use client";
import { m, type HTMLMotionProps } from "framer-motion";
import { hoverLift, pressScale, hoverScale } from "@/lib/motion";

export interface HoverLiftProps extends Omit<HTMLMotionProps<"div">, "whileHover" | "whileTap"> {
  /** Style of the hover micro-interaction. */
  effect?: "lift" | "scale" | "both";
  /** Disable the press scale. */
  noPress?: boolean;
}

/**
 * Wraps an interactive element with the platform's standard hover micro-
 * interactions: lift (-2px translate) and/or scale (1.03). Press feedback is
 * a quick scale 0.97. Use on cards, tiles, and anything clickable that isn't
 * already a <Button/>.
 */
export function HoverLift({
  effect = "lift",
  noPress = false,
  children,
  ...rest
}: HoverLiftProps) {
  const hover =
    effect === "lift" ? hoverLift : effect === "scale" ? hoverScale : { ...hoverLift, scale: 1.02 };
  return (
    <m.div whileHover={hover} whileTap={noPress ? undefined : pressScale} {...rest}>
      {children}
    </m.div>
  );
}
