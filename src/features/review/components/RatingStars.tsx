"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export interface RatingStarsProps {
  value: number;
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void;
  size?: number;
  readOnly?: boolean;
  className?: string;
}

export function RatingStars({
  value,
  onChange,
  size = 24,
  readOnly = false,
  className,
}: RatingStarsProps) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role={readOnly ? undefined : "radiogroup"}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(n as 1 | 2 | 3 | 4 | 5)}
            onMouseEnter={() => !readOnly && setHover(n)}
            aria-label={`${n} sao`}
            aria-checked={n === value}
            role={readOnly ? undefined : "radio"}
            className={cn(
              "transition-transform",
              !readOnly && "hover:scale-110 active:scale-95",
              readOnly && "cursor-default"
            )}
          >
            <Star
              size={size}
              strokeWidth={1.5}
              className={filled ? "fill-warning text-warning" : "text-text-subtle"}
            />
          </button>
        );
      })}
    </div>
  );
}
