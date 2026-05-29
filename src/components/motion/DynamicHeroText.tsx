"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export function DynamicHeroText() {
  const t = useTranslations("Home");
  const phrases = (t.raw("heroDynamicPhrases") ?? []) as string[];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <span className="relative inline-block text-brand-500 font-bold whitespace-nowrap min-w-[200px] sm:min-w-[280px] md:min-w-[360px] text-left">
      <AnimatePresence mode="wait">
        <m.span
          key={index}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1], // Custom premium easeOut
          }}
          className="inline-block"
        >
          {phrases[index]}
        </m.span>
      </AnimatePresence>

      {/* SVG Underline Path - Hand-drawn sketch look */}
      <span className="absolute -bottom-1 left-0 right-0 h-[8px] pointer-events-none block overflow-visible">
        <svg
          viewBox="0 0 320 12"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full text-brand-500/80 drop-shadow-[0_1px_2px_rgba(230,59,51,0.15)]"
        >
          <m.path
            key={index}
            // Double curved brush stroke for a premium organic look
            d="M 8 7 C 80 11, 160 3, 312 8 C 210 11, 110 5, 12 7"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: 0.25,
              duration: 0.95,
              ease: [0.25, 1, 0.5, 1],
            }}
          />
        </svg>
      </span>
    </span>
  );
}
