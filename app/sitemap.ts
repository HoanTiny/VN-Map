import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { categories } from "@/config/categories";
import { regions, provinces } from "@/config/regions";
import { allPlaces } from "@/features/map/lib/places-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/search`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/region`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/submit`, changeFrequency: "monthly", priority: 0.4 },
    ...regions.map((r) => ({
      url: `${base}/region/${r.key}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...provinces.map((p) => ({
      url: `${base}/region/${p.region}/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...categories.map((c) => ({
      url: `${base}/category/${c.key}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...allPlaces.map((p) => ({
      url: `${base}/place/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
