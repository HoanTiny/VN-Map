import type { MetadataRoute } from "next";
import { categories } from "@/config/categories";
import { regions, provinces } from "@/config/regions";
import { allPlaces } from "@/features/map/lib/places-data";
import { routing } from "@/i18n/routing";
import { absoluteUrl, localizedHref } from "@/i18n/metadata";

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function entry(path: string, changeFrequency: ChangeFreq, priority: number) {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = absoluteUrl(localizedHref(path, loc));
  }
  languages["x-default"] = absoluteUrl(localizedHref(path, routing.defaultLocale));
  return {
    url: absoluteUrl(localizedHref(path, routing.defaultLocale)),
    changeFrequency,
    priority,
    alternates: { languages },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry("/", "weekly", 1),
    entry("/explore", "daily", 0.9),
    entry("/search", "weekly", 0.5),
    entry("/region", "weekly", 0.7),
    entry("/submit", "monthly", 0.4),
    ...regions.map((r) => entry(`/region/${r.key}`, "weekly", 0.7)),
    ...provinces.map((p) => entry(`/region/${p.region}/${p.slug}`, "weekly", 0.6)),
    ...categories.map((c) => entry(`/category/${c.key}`, "weekly", 0.7)),
    ...allPlaces.map((p) => entry(`/place/${p.slug}`, "weekly", 0.5)),
  ];
}
