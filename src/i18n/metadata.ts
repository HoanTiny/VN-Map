import { siteConfig } from "@/config/site";
import { routing } from "./routing";

/**
 * Build the localized URL for a given path + locale.
 * Mirrors next-intl `localePrefix: "as-needed"`:
 *   - default locale (vi) → no prefix
 *   - other locales (en)  → `/en/...`
 */
export function localizedHref(path: string, locale: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return clean === "/" ? "/" : clean;
  }
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

/**
 * Returns Metadata.alternates for a route, including hreflang entries
 * for every supported locale plus an `x-default` pointing to the
 * default-locale variant. Pass an unprefixed canonical path
 * (e.g. `/place/foo`, `/category/cafe`, `/`).
 */
export function localizedAlternates(path: string, currentLocale?: string) {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = absoluteUrl(localizedHref(path, loc));
  }
  languages["x-default"] = absoluteUrl(localizedHref(path, routing.defaultLocale));

  const canonicalLocale = currentLocale ?? routing.defaultLocale;
  return {
    canonical: absoluteUrl(localizedHref(path, canonicalLocale)),
    languages,
  };
}
