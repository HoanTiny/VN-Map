"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";

type TimeOfDay = "day" | "sunset" | "night";
type Region = "hanoi" | "danang" | "saigon" | "default";

interface ImageItem {
  src: string;
  alt: string;
}

interface BackgroundPreset {
  images: ImageItem[];
  overlay: string; // Custom gradient overlay styling based on background brightness
}

const PRESETS: Record<Region, Record<TimeOfDay, BackgroundPreset>> = {
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

export function DynamicHeroBackground() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [region, setRegion] = useState<Region>("default");
  const [imageIndex, setImageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

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

    // 2. Geolocation (via silent non-blocking IP lookup)
    const detectRegion = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s strict timeout

        const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) return;
        const data = await res.json();

        const city = (data.city || "").toLowerCase();
        const regionName = (data.region || "").toLowerCase();

        if (city.includes("hanoi") || regionName.includes("hanoi")) {
          setRegion("hanoi");
        } else if (city.includes("da nang") || city.includes("danang") || regionName.includes("da nang") || regionName.includes("danang")) {
          setRegion("danang");
        } else if (
          city.includes("ho chi minh") ||
          city.includes("saigon") ||
          city.includes("hcm") ||
          regionName.includes("ho chi minh") ||
          regionName.includes("saigon")
        ) {
          setRegion("saigon");
        }
      } catch (err) {
        // Silent catch: Fail gracefully to default presets if blocked or offline
        console.log("IP geolocation fallback to default scenic preset.");
      }
    };

    detectRegion();
  }, []);

  // Reset image carousel index whenever region or timeOfDay shifts
  useEffect(() => {
    setImageIndex(0);
  }, [region, timeOfDay]);

  // Set up auto-rotation interval for multiple sceneries (Every 10 seconds for premium slow-tempo transitions)
  useEffect(() => {
    if (!isMounted) return;

    const currentImages = PRESETS[region][timeOfDay].images;
    if (currentImages.length <= 1) return;

    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % currentImages.length);
    }, 10000); // 10 seconds smooth rotation

    return () => clearInterval(interval);
  }, [region, timeOfDay, isMounted]);

  const currentPreset = isMounted ? PRESETS[region][timeOfDay] : PRESETS.default.day;
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
