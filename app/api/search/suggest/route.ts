import { NextResponse } from "next/server";
import { searchPlacesAsync } from "@/features/search/lib/search-server";
import { normalize } from "@/features/search/lib/search";
import { provinces, provinceBySlug, regionByKey, legacyProvinceMap } from "@/config/regions";
import { categories } from "@/config/categories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 60 requests per minute per IP — prevents search scraping
const SEARCH_RATE_LIMIT = 60;
const SEARCH_RATE_WINDOW_MS = 60 * 1000;
const searchRateStore = new Map<string, { count: number; resetAt: number }>();

function checkSearchRate(ip: string): boolean {
  const now = Date.now();
  for (const [k, v] of searchRateStore) if (now > v.resetAt) searchRateStore.delete(k);
  const entry = searchRateStore.get(ip);
  if (!entry || now > entry.resetAt) {
    searchRateStore.set(ip, { count: 1, resetAt: now + SEARCH_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= SEARCH_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

interface Suggestion {
  type: "place" | "region" | "category";
  id: string;
  label: string;
  sub?: string;
  href: string;
}

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkSearchRate(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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

  const seenProvinces = new Set<string>();
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
      seenProvinces.add(prov.slug);
      if (seenProvinces.size >= 4) break;
    }
  }

  // Also match legacy (pre-merger) province names — Bắc Giang → Bắc Ninh, …
  if (seenProvinces.size < 4) {
    for (const [oldName, newSlug] of Object.entries(legacyProvinceMap)) {
      if (seenProvinces.has(newSlug)) continue;
      const prov = provinceBySlug[newSlug];
      if (!prov || prov.name === oldName) continue;
      if (normalize(oldName).includes(nq)) {
        items.push({
          type: "region",
          id: `${prov.slug}-from-${newSlug}`,
          label: `${oldName} → ${prov.name}`,
          sub: `Đã sáp nhập vào ${prov.name}`,
          href: `/region/${prov.region}/${prov.slug}`,
        });
        seenProvinces.add(newSlug);
        if (seenProvinces.size >= 4) break;
      }
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
