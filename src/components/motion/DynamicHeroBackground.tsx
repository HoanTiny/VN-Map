"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";

type TimeOfDay = "day" | "sunset" | "night";

export interface DynamicHeroPreset {
  region: string;
  label: string;
  match_keywords: string[];
  is_default: boolean;
  presets: Record<TimeOfDay, BackgroundPreset>;
}

interface ImageItem {
  src: string;
  alt: string;
}

interface BackgroundPreset {
  images: ImageItem[];
  overlay: string; // Custom gradient overlay styling based on background brightness
}

const PRESETS: Record<string, Record<TimeOfDay, BackgroundPreset>> = {
  default: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85",
          alt: "Vịnh Hạ Long nắng trong xanh",
        },
        {
          src: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=2400&q=85",
          alt: "Danh thắng Tràng An Ninh Bình hùng vĩ",
        },
        {
          src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=85",
          alt: "Ruộng bậc thang xanh ngút ngàn Tây Bắc",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=855",
          alt: "Phố cổ Hội An hoàng hôn rực rỡ",
        },
        {
          src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85",
          alt: "Sông Hoài Hội An buổi chiều tà rực nắng",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85",
          alt: "Sài Gòn sông đêm lấp lánh chói sáng",
        },
        {
          src: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=2400&q=85",
          alt: "Phố cổ Hội An lung linh đèn lồng đêm",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  hanoi: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=2400&q=85",
          alt: "Hồ Gươm nắng sớm yên bình tháp Rùa",
        },
        {
          src: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=2400&q=85",
          alt: "Phố cổ Hà Nội nhộn nhịp ban ngày",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=2400&q=85",
          alt: "Hoàng hôn Hồ Tây nhuộm đỏ rực rỡ",
        },
        {
          src: "https://images.unsplash.com/photo-1543968996-ee822b8176bc?auto=format&fit=crop&w=2400&q=85",
          alt: "Cầu Long Biên nhuộm màu nắng chiều tà",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=85",
          alt: "Phố Tạ Hiện lung linh nhộn nhịp về đêm",
        },
        {
          src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85",
          alt: "Nhà Thờ Lớn Hà Nội lung linh ánh đèn đêm",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  danang: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2400&q=85",
          alt: "Cầu Vàng Bà Nà Hills trong nắng mây ngập tràn",
        },
        {
          src: "https://images.unsplash.com/photo-1559519529-0504685a7327?auto=format&fit=crop&w=2400&q=85",
          alt: "Bờ biển Đà Nẵng nắng xanh biếc",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85",
          alt: "Hoàng hôn biển Mỹ Khê vàng rực nắng chiều",
        },
        {
          src: "https://images.unsplash.com/photo-1545231027-63b3f162e0cd?auto=format&fit=crop&w=2400&q=85",
          alt: "Bán đảo Sơn Trà hoàng hôn bóng chiều",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1534008757030-27299c4371b6?auto=format&fit=crop&w=2400&q=85",
          alt: "Cầu Rồng phun lửa rực rỡ lấp lánh ban đêm",
        },
      ],
      overlay: "from-black/45 via-black/15 to-transparent",
    },
  },
  saigon: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2400&q=85",
          alt: "Bưu điện Trung tâm Sài Gòn ngày nắng đẹp",
        },
        {
          src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=85",
          alt: "Chung cư Cafe Nguyễn Huệ độc đáo giữa lòng phố",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=85",
          alt: "Hoàng hôn buông xuống sông Sài Gòn rực rỡ",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85",
          alt: "Đêm đô thị Sài Gòn lung linh Landmark 81 sông nước",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  hue: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?auto=format&fit=crop&w=2400&q=85",
          alt: "Đại Nội Huế cổ kính trầm mặc ngày nắng",
        },
        {
          src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85",
          alt: "Sông Hương thuyền rồng êm đềm trôi",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=2400&q=85",
          alt: "Cầu Trường Tiền in bóng sông Hương chiều tà",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=2400&q=85",
          alt: "Kinh thành Huế lung linh ánh đèn đêm",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  hoian: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2400&q=85",
          alt: "Phố cổ Hội An nhà cổ vàng dưới nắng",
        },
        {
          src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2400&q=85",
          alt: "Chùa Cầu Hội An biểu tượng phố cổ",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&w=2400&q=85",
          alt: "Sông Hoài Hội An hoàng hôn nhuộm vàng",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=2400&q=85",
          alt: "Đèn lồng Hội An lung linh đêm thả hoa đăng",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  nhatrang: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1559519529-0504685a7327?auto=format&fit=crop&w=2400&q=85",
          alt: "Biển Nha Trang xanh ngọc cát trắng ngày hè",
        },
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85",
          alt: "Vịnh Nha Trang nắng vàng thuyền câu",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1545231027-63b3f162e0cd?auto=format&fit=crop&w=2400&q=85",
          alt: "Hoàng hôn biển Nha Trang tím rực rỡ",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1534008757030-27299c4371b6?auto=format&fit=crop&w=2400&q=85",
          alt: "Vinpearl Nha Trang lung linh sáng đêm",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  sapa: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=85",
          alt: "Ruộng bậc thang Sapa xanh ngút ngàn mùa nước đổ",
        },
        {
          src: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=2400&q=85",
          alt: "Sapa biển mây trắng bồng bềnh sườn núi",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2400&q=85",
          alt: "Đỉnh Fansipan hoàng hôn rực hồng cam",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85",
          alt: "Sapa đêm sương lạnh đèn vàng ấm áp",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  phuquoc: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85",
          alt: "Bãi Sao Phú Quốc cát trắng nước xanh ngọc",
        },
        {
          src: "https://images.unsplash.com/photo-1559519529-0504685a7327?auto=format&fit=crop&w=2400&q=85",
          alt: "Vùng biển Phú Quốc thiên đường nhiệt đới",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1545231027-63b3f162e0cd?auto=format&fit=crop&w=2400&q=85",
          alt: "Cầu Hôn Phú Quốc hoàng hôn vàng son",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85",
          alt: "Phú Quốc đêm cảng cá nhộn nhịp ánh đèn",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  halong: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85",
          alt: "Vịnh Hạ Long nắng trong núi đá kì vĩ",
        },
        {
          src: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=2400&q=85",
          alt: "Du thuyền Hạ Long lướt giữa hàng nghìn đảo",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=2400&q=85",
          alt: "Hoàng hôn Vịnh Hạ Long vàng rực biển ngọc",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85",
          alt: "Hạ Long đêm du thuyền và đảo lung linh",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
};

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

// Hardcoded keyword fallback when running without DB.
const REGION_KEYWORDS: Record<string, string[]> = {
  hanoi: ["hanoi", "ha noi"],
  danang: ["da nang", "danang"],
  saigon: ["ho chi minh", "saigon", "hcm"],
  hue: ["hue", "thua thien"],
  hoian: ["hoi an", "hoian", "quang nam"],
  nhatrang: ["nha trang", "khanh hoa"],
  sapa: ["sa pa", "sapa", "lao cai"],
  phuquoc: ["phu quoc", "kien giang"],
  halong: ["ha long", "halong", "quang ninh", "hai phong"],
};

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

    // 2. If the server already resolved a region from request headers / IP, skip
    //    client-side fetch entirely (this is the common path on Vercel/Cloudflare
    //    and avoids 429 / CORS hits on free-tier IP APIs).
    if (initialRegion && index.byRegion.has(initialRegion)) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[hero-bg] using server-resolved region:", initialRegion);
      }
      return;
    }

    // 3. Geolocation — cache result for 24h to avoid hammering free-tier API.
    const CACHE_KEY = "mapvn:ipGeo";
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

    const matchAgainst = (city: string, regionName: string): string | null => {
      for (const preset of index.byRegion.values()) {
        if (preset.is_default) continue;
        const hit = preset.match_keywords.some((rawKw) => {
          const kw = normalizeForMatch(rawKw);
          return kw && (city.includes(kw) || regionName.includes(kw));
        });
        if (hit) return preset.region;
      }
      return null;
    };

    const applyGeo = (city: string, regionName: string) => {
      console.log("[hero-bg] geo:", { city, region: regionName });
      const matched = matchAgainst(city, regionName);
      if (matched) {
        console.log("[hero-bg] matched region:", matched);
        setRegion(matched);
      }
    };

    const detectRegion = async () => {
      // Try cache first
      try {
        const cached = window.localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as { city: string; region: string; ts: number };
          if (Date.now() - parsed.ts < CACHE_TTL_MS) {
            applyGeo(parsed.city, parsed.region);
            return;
          }
        }
      } catch {
        // ignore corrupt cache
      }

      // Chain of free IP geolocation providers — try each until one returns.
      // Fast-fail on rate-limit / network error and move to next.
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
          const res = await fetch(provider.url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!res.ok) {
            if (process.env.NODE_ENV !== "production") {
              console.warn(`[hero-bg] ${provider.name} ${res.status}, trying next…`);
            }
            continue;
          }
          const data = (await res.json()) as Record<string, unknown>;
          const { city: rawCity, region: rawRegion } = provider.parse(data);
          const city = normalizeForMatch(rawCity);
          const regionName = normalizeForMatch(rawRegion);
          if (!city && !regionName) continue;

          try {
            window.localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ city, region: regionName, ts: Date.now(), src: provider.name })
            );
          } catch {
            // localStorage unavailable (privacy mode)
          }

          if (process.env.NODE_ENV !== "production") {
            console.log(`[hero-bg] resolved via ${provider.name}`);
          }
          applyGeo(city, regionName);
          return;
        } catch {
          // Network error / timeout — try next provider.
        }
      }

      if (process.env.NODE_ENV !== "production") {
        console.warn("[hero-bg] all geo providers failed, using default preset");
      }
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
              className="absolute inset-0 w-full h-full"
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
