import { headers } from "next/headers";

export interface ServerGeo {
  city: string;
  region: string;
  country: string;
  source: "vercel" | "cloudflare" | "ipapi" | "geojs" | "none";
}

const EMPTY: ServerGeo = { city: "", region: "", country: "", source: "none" };

// In-memory cache keyed by IP. Lives for the lifetime of the server process
// (warm Vercel instance / long-running Node). Cold starts re-populate it.
// 12h TTL so we re-detect daily without spamming free-tier IP APIs.
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_ENTRIES = 5000; // cap to avoid memory blow-up
const geoCache = new Map<string, { data: ServerGeo; ts: number }>();

function readCache(ip: string): ServerGeo | null {
  if (!ip) return null;
  const entry = geoCache.get(ip);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    geoCache.delete(ip);
    return null;
  }
  return entry.data;
}

function writeCache(ip: string, data: ServerGeo) {
  if (!ip) return;
  if (geoCache.size >= MAX_ENTRIES) {
    // Drop oldest entry (Maps iterate in insertion order).
    const oldest = geoCache.keys().next().value;
    if (oldest) geoCache.delete(oldest);
  }
  geoCache.set(ip, { data, ts: Date.now() });
}

function normalize(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

/**
 * Server-side IP geolocation. Order:
 *   1. Vercel `x-vercel-ip-*` headers (free, no API call)
 *   2. Cloudflare `cf-ipcountry` + city headers
 *   3. ip-api.com fallback (server-side fetch — no CORS issues)
 *   4. geojs.io as last resort
 * Returns normalized lowercase strings ready for keyword matching.
 */
export async function detectServerGeo(): Promise<ServerGeo> {
  try {
    const h = await headers();

    // Vercel edge headers (no API key needed when deployed on Vercel).
    const vCity = h.get("x-vercel-ip-city");
    const vRegion = h.get("x-vercel-ip-country-region");
    const vCountry = h.get("x-vercel-ip-country");
    if (vCity || vRegion) {
      return {
        city: normalize(decodeURIComponent(vCity ?? "")),
        region: normalize(decodeURIComponent(vRegion ?? "")),
        country: normalize(vCountry ?? ""),
        source: "vercel",
      };
    }

    // Cloudflare
    const cfCity = h.get("cf-ipcity");
    const cfRegion = h.get("cf-region");
    const cfCountry = h.get("cf-ipcountry");
    if (cfCity || cfRegion) {
      return {
        city: normalize(cfCity ?? ""),
        region: normalize(cfRegion ?? ""),
        country: normalize(cfCountry ?? ""),
        source: "cloudflare",
      };
    }

    // Fallback: server-side fetch (no CORS issues here).
    // Pick up the user's IP from forwarded header so the API geolocates the
    // actual client, not the server.
    const forwarded = h.get("x-forwarded-for") ?? "";
    const ip = forwarded.split(",")[0]?.trim() || "";

    // Hit in-memory cache before re-calling external APIs.
    const cached = readCache(ip || "server");
    if (cached) return cached;

    // ip-api.com — free, 45 req/min from same IP, HTTPS via "https://" endpoint.
    try {
      const url = ip
        ? `https://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country`
        : `https://ip-api.com/json/?fields=status,city,regionName,country`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
      clearTimeout(t);
      if (res.ok) {
        const j = (await res.json()) as {
          status?: string;
          city?: string;
          regionName?: string;
          country?: string;
        };
        if (j.status === "success") {
          const data: ServerGeo = {
            city: normalize(j.city),
            region: normalize(j.regionName),
            country: normalize(j.country),
            source: "ipapi",
          };
          writeCache(ip || "server", data);
          return data;
        }
      }
    } catch {
      // fall through to next provider
    }

    // geojs.io — generous, free.
    try {
      const url = ip
        ? `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`
        : `https://get.geojs.io/v1/ip/geo.json`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
      clearTimeout(t);
      if (res.ok) {
        const j = (await res.json()) as {
          city?: string;
          region?: string;
          country?: string;
        };
        const data: ServerGeo = {
          city: normalize(j.city),
          region: normalize(j.region),
          country: normalize(j.country),
          source: "geojs",
        };
        writeCache(ip || "server", data);
        return data;
      }
    } catch {
      // ignore
    }

    return EMPTY;
  } catch {
    return EMPTY;
  }
}
