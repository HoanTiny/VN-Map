import { NextResponse } from "next/server";
import { searchPlacesAsync } from "@/features/search/lib/search-server";
import { normalize } from "@/features/search/lib/search";
import { provinces, regionByKey } from "@/config/regions";
import { categories } from "@/config/categories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Suggestion {
  type: "place" | "region" | "category";
  id: string;
  label: string;
  sub?: string;
  href: string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) {
    return NextResponse.json({ items: [] satisfies Suggestion[] });
  }

  const nq = normalize(q);
  const items: Suggestion[] = [];

  const { items: places } = await searchPlacesAsync({ q, sort: "rating" });
  for (const p of places.slice(0, 6)) {
    items.push({
      type: "place",
      id: p.id,
      label: p.name,
      sub: [p.province, p.district].filter(Boolean).join(" · "),
      href: `/place/${p.slug}`,
    });
  }

  for (const prov of provinces) {
    if (normalize(prov.name).includes(nq)) {
      const region = regionByKey[prov.region];
      items.push({
        type: "region",
        id: prov.slug,
        label: prov.name,
        sub: region?.label ?? "Vùng miền",
        href: `/region/${prov.region}/${prov.slug}`,
      });
      if (items.filter((i) => i.type === "region").length >= 4) break;
    }
  }

  for (const c of categories) {
    if (normalize(c.labelVi).includes(nq) || normalize(c.label).includes(nq)) {
      items.push({
        type: "category",
        id: c.key,
        label: c.labelVi,
        sub: "Danh mục",
        href: `/category/${c.key}`,
      });
      if (items.filter((i) => i.type === "category").length >= 3) break;
    }
  }

  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
