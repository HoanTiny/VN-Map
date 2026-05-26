import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"] as const,
  defaultLocale: "vi",
  // VI = no prefix (/, /explore), EN = /en, /en/explore
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
