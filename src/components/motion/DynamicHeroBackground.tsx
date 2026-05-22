"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { closestProvince } from "@/config/regions";
import {
  PRESETS,
  REGION_KEYWORDS,
  type TimeOfDay,
  type BackgroundPreset,
  type ImageItem,
} from "@/config/hero-presets";

export interface DynamicHeroPreset {
  region: string;
  label: string;
  match_keywords: string[];
  is_default: boolean;
  presets: Record<TimeOfDay, BackgroundPreset>;
}


function getProxiedUrl(url: string): string {
  if (!url) return "";
  // Route through Cloudflare-backed wsrv.nl CDN to bypass Vietnamese ISP DNS blocks on images.unsplash.com
  if (url.includes("images.unsplash.com")) {
    const baseUrl = url.split("?")[0] || url;
    return `https://wsrv.nl/?url=${encodeURIComponent(baseUrl)}&w=1920&q=82&output=webp`;
  }
  return url;
}

// Decorative background image with proxy + direct URL fallback
// alt="" intentional: decorative images must have empty alt per WCAG
function BgImg({ src }: { src: string }) {
  const [imgSrc, setImgSrc] = useState(() => getProxiedUrl(src));

  useEffect(() => {
    setImgSrc(getProxiedUrl(src));
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt=""
      aria-hidden="true"
      role="presentation"
      onError={() => {
        // If proxy fails, fall back to the original direct URL
        if (!imgSrc.includes("wsrv.nl")) return;
        setImgSrc(src);
      }}
      className="w-full h-full object-cover select-none pointer-events-none"
    />
  );
}

interface DynamicHeroBackgroundProps {
  /** DB-driven presets. If omitted/empty, fall back to hardcoded PRESETS map. */
  presets?: DynamicHeroPreset[];
  /** Region key resolved server-side (from request headers / IP). Skips client-side fetch. */
  initialRegion?: string | null;
}

function buildPresetIndex(presets: DynamicHeroPreset[] | undefined) {
  if (presets && presets.length > 0) {
    const byRegion = new Map<string, DynamicHeroPreset>();
    let defaultRegion = "default";
    for (const p of presets) {
      byRegion.set(p.region, p);
      if (p.is_default) defaultRegion = p.region;
    }
    if (!byRegion.has(defaultRegion) && presets[0]) {
      defaultRegion = presets[0].region;
    }
    return { byRegion, defaultRegion, fromDb: true as const };
  }
  // Fallback: hardcoded map
  const byRegion = new Map<string, DynamicHeroPreset>();
  for (const [region, byTime] of Object.entries(PRESETS)) {
    byRegion.set(region, {
      region,
      label: region,
      match_keywords: REGION_KEYWORDS[region] ?? [],
      is_default: region === "default",
      presets: byTime,
    });
  }
  return { byRegion, defaultRegion: "default", fromDb: false as const };
}

/** Strip Vietnamese diacritics + đ→d so "Hà Nội" matches "ha noi". */
function normalizeForMatch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}

export function DynamicHeroBackground({
  presets,
  initialRegion,
}: DynamicHeroBackgroundProps = {}) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [imageIndex, setImageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const index = buildPresetIndex(presets);
  const [region, setRegion] = useState<string>(
    initialRegion && index.byRegion.has(initialRegion) ? initialRegion : index.defaultRegion
  );

  useEffect(() => {
    setIsMounted(true);

    // 1. Detect Time of Day based on client hour
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 16) {
      setTimeOfDay("day");
    } else if (hour >= 16 && hour < 18.5) {
      setTimeOfDay("sunset");
    } else {
      setTimeOfDay("night");
    }

    // 2. Geolocation — Fetch and match region to load corresponding presets.
    const matchAgainst = (city: string, regionName: string): string | null => {
      const c = normalizeForMatch(city).replace(/-/g, " ");
      const r = normalizeForMatch(regionName).replace(/-/g, " ");
      console.log("[hero-bg] matching normalized inputs:", { c, r });
      for (const preset of index.byRegion.values()) {
        if (preset.is_default) continue;
        const hit = preset.match_keywords.some((rawKw) => {
          const kw = normalizeForMatch(rawKw);
          return kw && (c.includes(kw) || r.includes(kw));
        });
        if (hit) return preset.region;
      }
      return null;
    };

    const applyGeo = (city: string, regionName: string) => {
      console.log("[hero-bg] applying geo:", { city, region: regionName });
      const matched = matchAgainst(city, regionName);
      if (matched) {
        console.log("[hero-bg] matched preset region:", matched);
        setRegion(matched);
      } else {
        console.warn("[hero-bg] no preset matched. Defaulting to:", index.defaultRegion);
      }
    };

    const detectRegion = async () => {
      // 1. Try HTML5 Geolocation first if available
      if (typeof window !== "undefined" && navigator.geolocation) {
        console.log("[hero-bg] attempting HTML5 Geolocation...");
        const getGPSLocation = (): Promise<GeolocationPosition> => {
          return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 3000,             // 3 seconds timeout
              maximumAge: 10 * 60 * 1000 // 10 minutes cache
            });
          });
        };

        try {
          const position = await getGPSLocation();
          const { latitude, longitude } = position.coords;
          console.log("[hero-bg] GPS coordinates resolved:", { latitude, longitude });
          const province = closestProvince([longitude, latitude]);
          console.log("[hero-bg] closest province resolved:", province.name, province.slug);
          applyGeo(province.slug, province.name);
          return; // Geolocation succeeded, exit.
        } catch (err) {
          console.warn("[hero-bg] GPS failed or timed out, checking fallback:", err);
        }
      }

      // 2. Chain of free IP geolocation providers fallback (Second priority)
      const providers: Array<{
        name: string;
        url: string;
        parse: (j: Record<string, unknown>) => { city: string; region: string };
      }> = [
          {
            name: "ipwho.is",
            url: "https://ipwho.is/",
            parse: (j) => ({ city: String(j.city ?? ""), region: String(j.region ?? "") }),
          },
          {
            name: "freeipapi",
            url: "https://freeipapi.com/api/json",
            parse: (j) => ({
              city: String(j.cityName ?? ""),
              region: String(j.regionName ?? ""),
            }),
          },
          {
            name: "geojs",
            url: "https://get.geojs.io/v1/ip/geo.json",
            parse: (j) => ({
              city: String(j.city ?? ""),
              region: String(j.region ?? ""),
            }),
          },
        ];

      for (const provider of providers) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          console.log(`[hero-bg] fetching client IP geo from ${provider.name}...`);
          const res = await fetch(provider.url, { signal: controller.signal });

          console.log('provider res', { res })
          clearTimeout(timeoutId);

          if (!res.ok) {
            console.warn(`[hero-bg] ${provider.name} failed with status: ${res.status}`);
            continue;
          }
          const data = (await res.json()) as Record<string, unknown>;

          console.log('provider data', { data })
          const { city: rawCity, region: rawRegion } = provider.parse(data);
          const city = normalizeForMatch(rawCity);
          const regionName = normalizeForMatch(rawRegion);

          if (!city && !regionName) {
            console.warn(`[hero-bg] ${provider.name} returned empty city/region`);
            continue;
          }

          const matched = matchAgainst(city, regionName);
          if (matched) {
            console.log(`[hero-bg] successfully resolved and matched via ${provider.name}:`, matched);
            setRegion(matched);
            return; // Matched, exit detectRegion.
          } else {
            console.warn(`[hero-bg] ${provider.name} resolved to ${city}/${regionName} but did not match any preset.`);
          }
        } catch (err) {
          console.error(`[hero-bg] ${provider.name} error:`, err);
        }
      }

      // 3. If GPS and client IP providers failed or didn't match, fall back to server-resolved initialRegion (Third priority)
      if (initialRegion && index.byRegion.has(initialRegion)) {
        console.log("[hero-bg] GPS and IP APIs failed/did not match. Falling back to server-resolved initialRegion:", initialRegion);
        setRegion(initialRegion);
        return;
      }

      console.warn("[hero-bg] all geo options failed, using default preset:", index.defaultRegion);
    };

    detectRegion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeRegionData =
    index.byRegion.get(region) ?? index.byRegion.get(index.defaultRegion);
  const currentPreset = activeRegionData?.presets[timeOfDay] ??
    activeRegionData?.presets.day ?? { images: [], overlay: "from-black/35 via-black/10 to-transparent" };

  // Reset image carousel index whenever region or timeOfDay shifts
  useEffect(() => {
    setImageIndex(0);
  }, [region, timeOfDay]);

  // Set up auto-rotation interval (10s slow Ken Burns)
  useEffect(() => {
    if (!isMounted) return;
    if (currentPreset.images.length <= 1) return;

    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % currentPreset.images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [region, timeOfDay, isMounted, currentPreset.images.length]);
  const activeImage = (currentPreset.images[imageIndex] || currentPreset.images[0] || { src: "", alt: "" }) as ImageItem;

  return (
    <>
      {/* Background Images and Gradients wrapper (Negative Z-Index) */}
      <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
        {isMounted && (
          <AnimatePresence mode="popLayout">
            <m.div
              key={`${region}-${timeOfDay}-${imageIndex}`}
              initial={{ opacity: 0.1, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1.0 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.5, ease: "easeInOut" }, // Slightly longer fade for double visual comfort
                scale: { duration: 10.0, ease: "easeOut" }, // Slower Ken Burns effect to match rotation
              }}
              className="absolute inset-0 w-full h-full [will-change:transform,opacity] [transform:translate3d(0,0,0)]"
            >
              {/* Background Image - BgImg handles proxy + direct URL fallback and always has alt="" */}
              <BgImg src={activeImage.src} />
            </m.div>
          </AnimatePresence>
        )}

        {/* Dynamic dark gradient overlay based on time of day (Ensures high text contrast) */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${currentPreset.overlay} transition-all duration-[1200ms] ease-in-out`}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Ambient night atmosphere particle effect when it is night time */}
        {isMounted && timeOfDay === "night" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 mix-blend-screen">
            <div className="stars-overlay absolute inset-0 bg-[radial-gradient(1.5px_1.5px_at_20px_30px,#fff,rgba(0,0,0,0)),radial-gradient(2px_2px_at_40px_70px,#fff,rgba(0,0,0,0)),radial-gradient(1.5px_1.5px_at_50px_160px,#fff,rgba(0,0,0,0)),radial-gradient(2px_2px_at_90px_40px,#fff,rgba(0,0,0,0)),radial-gradient(2px_2px_at_130px_80px,#fff,rgba(0,0,0,0))] bg-repeat w-full h-full animate-[pulse_6s_infinite]" />
          </div>
        )}
      </div>

      {/* Slide pagination dots - Centered horizontally at the bottom of the hero background */}
      {isMounted && currentPreset.images.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-slow">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 dark:bg-black/60 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
            {currentPreset.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setImageIndex(idx)}
                className={`transition-all duration-500 ease-out ${idx === imageIndex
                  ? "w-4 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(218,37,29,0.7)] scale-110"
                  : "w-1.5 h-1.5 rounded-full bg-white/45 hover:bg-white/75 hover:scale-125"
                  }`}
                title={`Ảnh ${idx + 1}`}
                aria-label={`Chuyển đến ảnh ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

    </>
  );
}
