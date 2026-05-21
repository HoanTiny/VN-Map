import Link from "next/link";
import { Map, Search as SearchIcon } from "lucide-react";
import { Reveal } from "@/components/motion";
import { Button } from "@/ui/button";
import { searchPlacesAsync, type SearchFilters as Filters } from "@/features/search/lib/search";
import { SearchFilters } from "@/features/search/components/SearchFilters";
import { PlaceGrid } from "@/features/place/components/PlaceGrid";
import type { CategoryKey } from "@/config/categories";

export const metadata = {
  title: "Tìm kiếm · Map-VN",
};

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

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container">
        <Reveal>
          <p className="text-overline text-brand-600">TÌM KIẾM</p>
          <h1 className="mt-2 font-display text-h1 text-text md:text-display-lg">
            {filters.q ? <>Kết quả cho “{filters.q}”</> : <>Tất cả địa điểm</>}
          </h1>
        </Reveal>

        <SearchFilters total={total} />

        <div className="mt-6">
          {items.length > 0 ? (
            <PlaceGrid places={items} />
          ) : (
            <EmptyState q={filters.q} />
          )}
        </div>

        {items.length > 0 && (
          <Reveal>
            <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center">
              <p className="font-display text-h3 text-text">Khám phá toàn bộ trên bản đồ</p>
              <p className="mt-1 text-body-sm text-text-muted">
                Xem {total} kết quả trên bản đồ tương tác — pan, zoom, filter.
              </p>
              <Button className="mt-4" asChild>
                <Link
                  href={`/explore${filters.cat ? `?cat=${filters.cat}` : ""}`}
                >
                  <Map size={16} /> Mở bản đồ
                </Link>
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}

function EmptyState({ q }: { q?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text-muted">
        <SearchIcon size={20} />
      </div>
      <p className="font-display text-h3 text-text">
        Không tìm thấy {q ? `"${q}"` : "kết quả"}
      </p>
      <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">
        Thử từ khoá khác, bỏ bớt filter, hoặc mở bản đồ để khám phá.
      </p>
      <Button variant="secondary" className="mt-4" asChild>
        <Link href="/explore">Mở bản đồ</Link>
      </Button>
    </div>
  );
}
