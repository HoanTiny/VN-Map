import Link from "next/link";
import { Map, Search as SearchIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion";
import { Button } from "@/ui/button";
import { searchPlacesAsync } from "@/features/search/lib/search-server";
import { type SearchFilters as Filters } from "@/features/search/lib/search";
import { SearchFilters } from "@/features/search/components/SearchFilters";
import { PlaceGrid } from "@/features/place/components/PlaceGrid";
import type { CategoryKey } from "@/config/categories";

export async function generateMetadata() {
  const t = await getTranslations("SearchPage");
  return { title: t("metaTitle") };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters: Filters = {
    q: sp.q,
    cat: sp.cat as CategoryKey | undefined,
    province: sp.province,
    sort: (sp.sort as Filters["sort"]) ?? "rating",
  };

  const { items, total } = await searchPlacesAsync(filters);
  const t = await getTranslations("SearchPage");

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container">
        <Reveal>
          <p className="text-overline text-brand-600">{t("overline")}</p>
          <h1 className="mt-2 font-display text-h1 text-text md:text-display-lg">
            {filters.q ? t("resultsFor", { q: filters.q }) : t("allPlaces")}
          </h1>
        </Reveal>

        <SearchFilters total={total} />

        <div className="mt-6">
          {items.length > 0 ? (
            <PlaceGrid places={items} />
          ) : (
            <EmptyState q={filters.q} t={t} />
          )}
        </div>

        {items.length > 0 && (
          <Reveal>
            <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center">
              <p className="font-display text-h3 text-text">{t("exploreAllOnMap")}</p>
              <p className="mt-1 text-body-sm text-text-muted">
                {t("exploreAllOnMapHint", { total })}
              </p>
              <Button className="mt-4" asChild>
                <Link
                  href={`/explore${filters.cat ? `?cat=${filters.cat}` : ""}`}
                >
                  <Map size={16} /> {t("openMap")}
                </Link>
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}

function EmptyState({
  q,
  t,
}: {
  q?: string;
  t: Awaited<ReturnType<typeof getTranslations<"SearchPage">>>;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text-muted">
        <SearchIcon size={20} />
      </div>
      <p className="font-display text-h3 text-text">
        {q ? t("noResults", { q: `"${q}"` }) : t("noResultsAny")}
      </p>
      <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">
        {t("noResultsHint")}
      </p>
      <Button variant="secondary" className="mt-4" asChild>
        <Link href="/explore">{t("openMap")}</Link>
      </Button>
    </div>
  );
}
