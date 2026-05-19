import {
  Waves,
  Mountain,
  Landmark,
  UtensilsCrossed,
  Building2,
  TreePine,
  Coffee,
  Martini,
  Sunset,
  Camera,
  Compass,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Categories cho Vietnam Experience Map.
 *
 * Cấu trúc gồm 2 nhóm:
 *  - Travel (6 categories): beach, mountain, heritage, food, city, nature
 *    — du lịch broad, phù hợp khám phá vùng miền.
 *  - Lifestyle (6 categories): cafe, nightlife, rooftop, checkin, hidden, experience
 *    — ăn chơi nightlife, cộng đồng.
 *
 * Tất cả community-extensible: user có thể đề xuất category mới
 * (lưu localStorage / DB với source: "community", surface sau khi mod duyệt).
 */
export type CategoryKey =
  // Travel
  | "beach"
  | "mountain"
  | "heritage"
  | "food"
  | "city"
  | "nature"
  // Lifestyle
  | "cafe"
  | "nightlife"
  | "rooftop"
  | "checkin"
  | "hidden"
  | "experience";

export type CategoryGroup = "travel" | "lifestyle";

export interface Category {
  key: CategoryKey;
  label: string;
  labelVi: string;
  color: string;
  icon: LucideIcon;
  group: CategoryGroup;
  description: string;
  source: "seed" | "community";
}

export const categories: Category[] = [
  // ── Travel ─────────────────────────────────────────────
  {
    key: "beach",
    label: "Beach",
    labelVi: "Biển",
    color: "var(--cat-beach)",
    icon: Waves,
    group: "travel",
    description: "Bãi biển, đảo, vịnh — Hạ Long đến Phú Quốc",
    source: "seed",
  },
  {
    key: "mountain",
    label: "Mountain",
    labelVi: "Núi",
    color: "var(--cat-mountain)",
    icon: Mountain,
    group: "travel",
    description: "Đỉnh núi, ruộng bậc thang, cao nguyên",
    source: "seed",
  },
  {
    key: "heritage",
    label: "Heritage",
    labelVi: "Di sản",
    color: "var(--cat-heritage)",
    icon: Landmark,
    group: "travel",
    description: "Di sản văn hoá, đền chùa, phố cổ",
    source: "seed",
  },
  {
    key: "food",
    label: "Food",
    labelVi: "Quán ăn",
    color: "var(--cat-food)",
    icon: UtensilsCrossed,
    group: "travel",
    description: "Phở, bún chả, cơm tấm — món ngon từng vùng",
    source: "seed",
  },
  {
    key: "city",
    label: "City",
    labelVi: "Đô thị",
    color: "var(--cat-city)",
    icon: Building2,
    group: "travel",
    description: "Thành phố lớn — Hà Nội, Sài Gòn, Đà Nẵng",
    source: "seed",
  },
  {
    key: "nature",
    label: "Nature",
    labelVi: "Thiên nhiên",
    color: "var(--cat-nature)",
    icon: TreePine,
    group: "travel",
    description: "Vườn quốc gia, hang động, rừng nguyên sinh",
    source: "seed",
  },

  // ── Lifestyle ──────────────────────────────────────────
  {
    key: "cafe",
    label: "Cafe",
    labelVi: "Cafe",
    color: "var(--cat-cafe)",
    icon: Coffee,
    group: "lifestyle",
    description: "Cafe đẹp & đặc sản — trứng, muối, third-wave",
    source: "seed",
  },
  {
    key: "nightlife",
    label: "Nightlife",
    labelVi: "Bar & Pub",
    color: "var(--cat-nightlife)",
    icon: Martini,
    group: "lifestyle",
    description: "Bar, pub, club, speakeasy — đêm Việt Nam",
    source: "seed",
  },
  {
    key: "rooftop",
    label: "Rooftop",
    labelVi: "Rooftop",
    color: "var(--cat-rooftop)",
    icon: Sunset,
    group: "lifestyle",
    description: "Rooftop bar & cafe — view thành phố từ trên cao",
    source: "seed",
  },
  {
    key: "checkin",
    label: "Check-in",
    labelVi: "Check-in",
    color: "var(--cat-checkin)",
    icon: Camera,
    group: "lifestyle",
    description: "Spot chụp ảnh nổi tiếng — tường vàng, phố cổ, neon",
    source: "seed",
  },
  {
    key: "hidden",
    label: "Hidden gems",
    labelVi: "Hidden gems",
    color: "var(--cat-hidden)",
    icon: Compass,
    group: "lifestyle",
    description: "Quán ngõ, hẻm bí mật — ít người biết, nhiều bất ngờ",
    source: "seed",
  },
  {
    key: "experience",
    label: "Experience",
    labelVi: "Trải nghiệm",
    color: "var(--cat-experience)",
    icon: Sparkles,
    group: "lifestyle",
    description: "Workshop, tour local, làng nghề, culture",
    source: "seed",
  },
];

export const categoryByKey = Object.fromEntries(categories.map((c) => [c.key, c])) as Record<
  CategoryKey,
  Category
>;

export const categoriesByGroup: Record<CategoryGroup, Category[]> = {
  travel: categories.filter((c) => c.group === "travel"),
  lifestyle: categories.filter((c) => c.group === "lifestyle"),
};
