import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { categoryByKey, categories, type CategoryKey } from "@/config/categories";
import { listPlacesByCategory } from "@/features/place/lib/queries";
import { PlaceGrid } from "@/features/place/components/PlaceGrid";
import { ProvinceFilterChips } from "@/features/place/components/ProvinceFilterChips";
import { siteConfig } from "@/config/site";
import { localizedAlternates } from "@/i18n/metadata";

interface Params {
  slug: string;
}

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.key }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [t, locale] = await Promise.all([getTranslations("CategoryPage"), getLocale()]);
  const cat = categoryByKey[slug as CategoryKey];
  if (!cat) return { title: t("notFound") };
  const label = locale === "en" ? cat.label : cat.labelVi;
  const ogUrl = `${siteConfig.url}/api/og?title=${encodeURIComponent(label)}&subtitle=${encodeURIComponent(cat.description)}&tag=${encodeURIComponent("Map-VN · " + label)}&locale=${locale}`;
  return {
    title: t("metaTitle", { name: label }),
    description: cat.description,
    openGraph: {
      title: label,
      description: cat.description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: label, description: cat.description },
    alternates: localizedAlternates(`/category/${slug}`, locale),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = categoryByKey[slug as CategoryKey];
  if (!cat) notFound();

  const [all, t, locale] = await Promise.all([
    listPlacesByCategory(cat.key),
    getTranslations("CategoryPage"),
    getLocale(),
  ]);
  const provinceFilter = sp.province ?? null;
  const visible = provinceFilter ? all.filter((p) => slugify(p.province) === provinceFilter) : all;

  const provinceMap = new Map<string, { label: string; count: number }>();
  all.forEach((p) => {
    const key = slugify(p.province);
    const prev = provinceMap.get(key);
    if (prev) prev.count += 1;
    else provinceMap.set(key, { label: p.province, count: 1 });
  });
  const provinces = [...provinceMap.entries()]
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => b.count - a.count);

  const Icon = cat.icon;
  const label = locale === "en" ? cat.label : cat.labelVi;

  return (
    <article className="pb-24">
      <section
        className="relative isolate overflow-hidden"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${cat.color} 18%, transparent) 0%, transparent 60%)`,
        }}
      >
        <div className="container pt-24 pb-12 md:pt-28 md:pb-16">
          <Reveal direction="up" distance={12}>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-body-sm text-text-muted hover:text-text"
            >
              <ArrowLeft size={14} /> {t("home")}
            </Link>
          </Reveal>

          <div className="mt-6 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <Reveal direction="up" delay={0.05}>
              <div>
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-md"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${cat.color} 20%, white)`,
                    color: cat.color,
                  }}
                >
                  <Icon size={26} />
                </div>
                <h1 className="mt-4 font-display text-display-lg text-text">
                  {label}
                </h1>
                <p className="mt-2 max-w-2xl text-body-lg text-text-muted">{cat.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-body-sm text-text-muted">
                  <Badge variant="neutral">{t("placeCount", { count: all.length })}</Badge>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {t("provinceCount", { count: provinces.length })}
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.1}>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/explore?cat=${cat.key}`}>{t("viewOnMap")}</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/submit">{t("contribute")}</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="mb-8">
          <Reveal>
            <ProvinceFilterChips provinces={provinces} />
          </Reveal>
        </div>

        <Reveal>
          <p className="mb-4 text-body-sm text-text-muted">
            {provinceFilter
              ? t("resultsInProvince", {
                  count: visible.length,
                  province: provinceMap.get(provinceFilter)?.label ?? "",
                })
              : t("resultsCount", { count: visible.length })}
          </p>
        </Reveal>

        <PlaceGrid places={visible} />
      </section>
    </article>
  );
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}
