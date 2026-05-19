/**
 * Vietnam regions + provinces with metadata used by /region/* routes.
 *
 * `slug` is the URL-safe identifier (matches what `slugify(place.province)`
 * produces in places-data). `provinceName` is the display name as stored on
 * each PlaceFeature so we can cross-reference.
 */

export type RegionKey = "bac" | "trung" | "nam";

export interface Province {
  slug: string;
  name: string;            // Display name (matches PlaceItem.province)
  region: RegionKey;
  center: [number, number]; // [lng, lat] for mini-map / explore deep-link
  cover: string;
  tagline: string;
}

export interface Region {
  key: RegionKey;
  label: string;
  description: string;
  cover: string;
}

export const regions: Region[] = [
  {
    key: "bac",
    label: "Miền Bắc",
    description: "Núi rừng Tây Bắc, di sản Hà Nội nghìn năm, vịnh biển Đông Bắc.",
    cover: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1400&q=80",
  },
  {
    key: "trung",
    label: "Miền Trung",
    description: "Di sản UNESCO, bãi biển dài, ẩm thực cố đô.",
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1400&q=80",
  },
  {
    key: "nam",
    label: "Miền Nam",
    description: "Năng lượng đô thị, biển đảo, mekong & ẩm thực 24/7.",
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&q=80",
  },
];

export const regionByKey = Object.fromEntries(regions.map((r) => [r.key, r])) as Record<
  RegionKey,
  Region
>;

export const provinces: Province[] = [
  // ── Miền Bắc ─────────────────────────────────────────────
  {
    slug: "ha-noi", name: "Hà Nội", region: "bac",
    center: [105.8542, 21.0285],
    cover: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1400&q=80",
    tagline: "Thủ đô nghìn năm — phố cổ, cafe trứng, ẩm thực vỉa hè.",
  },
  {
    slug: "hai-phong", name: "Hải Phòng", region: "bac",
    center: [106.6881, 20.8449],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Thành phố hoa phượng đỏ, cửa ngõ đảo Cát Bà.",
  },
  {
    slug: "quang-ninh", name: "Quảng Ninh", region: "bac",
    center: [107.1839, 20.9101],
    cover: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=1400&q=80",
    tagline: "Vịnh Hạ Long — di sản thiên nhiên thế giới.",
  },
  {
    slug: "lao-cai", name: "Lào Cai", region: "bac",
    center: [103.8438, 22.3364],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Sa Pa, Fansipan, ruộng bậc thang mây bay.",
  },
  {
    slug: "ha-giang", name: "Hà Giang", region: "bac",
    center: [104.9836, 22.8233],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Cao nguyên đá Đồng Văn, cung Hà Giang Loop.",
  },
  {
    slug: "yen-bai", name: "Yên Bái", region: "bac",
    center: [104.0894, 21.8489],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Mù Cang Chải — ruộng bậc thang tháng 9.",
  },
  {
    slug: "ninh-binh", name: "Ninh Bình", region: "bac",
    center: [105.9744, 20.2506],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Vịnh Hạ Long trên cạn, Tam Cốc, Tràng An.",
  },
  {
    slug: "bac-kan", name: "Bắc Kạn", region: "bac",
    center: [105.6244, 22.4081],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Hồ Ba Bể — homestay người Tày.",
  },

  // ── Miền Trung ───────────────────────────────────────────
  {
    slug: "quang-binh", name: "Quảng Bình", region: "trung",
    center: [106.2825, 17.5879],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Phong Nha — Kẻ Bàng, hang động lớn nhất thế giới.",
  },
  {
    slug: "thua-thien-hue", name: "Thừa Thiên Huế", region: "trung",
    center: [107.5909, 16.4637],
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&q=80",
    tagline: "Cố đô — Đại Nội, bún bò, áo dài.",
  },
  {
    slug: "da-nang", name: "Đà Nẵng", region: "trung",
    center: [108.2022, 16.0544],
    cover: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1400&q=80",
    tagline: "Biển Mỹ Khê, cầu Vàng, sky bar sông Hàn.",
  },
  {
    slug: "quang-nam", name: "Quảng Nam", region: "trung",
    center: [108.3380, 15.8801],
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1400&q=80",
    tagline: "Hội An đèn lồng, Mỹ Sơn Chăm-pa, An Bàng.",
  },
  {
    slug: "binh-dinh", name: "Bình Định", region: "trung",
    center: [109.2197, 13.7820],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Quy Nhơn — Eo Gió, biển hoang sơ.",
  },
  {
    slug: "khanh-hoa", name: "Khánh Hoà", region: "trung",
    center: [109.1968, 12.2388],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Vịnh Nha Trang — lặn biển, tour đảo.",
  },

  // ── Miền Nam ─────────────────────────────────────────────
  {
    slug: "lam-dong", name: "Lâm Đồng", region: "nam",
    center: [108.4583, 11.9404],
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&q=80",
    tagline: "Đà Lạt — sương mù, rừng thông, cafe.",
  },
  {
    slug: "binh-thuan", name: "Bình Thuận", region: "nam",
    center: [108.2902, 10.9418],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Mũi Né — đồi cát, kite-surf.",
  },
  {
    slug: "tp-hcm", name: "TP. HCM", region: "nam",
    center: [106.7009, 10.7769],
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&q=80",
    tagline: "Sài Gòn — bánh mì, cơm tấm, rooftop, speakeasy.",
  },
  {
    slug: "can-tho", name: "Cần Thơ", region: "nam",
    center: [105.7469, 10.0452],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Mekong — chợ nổi Cái Răng.",
  },
  {
    slug: "kien-giang", name: "Kiên Giang", region: "nam",
    center: [103.9670, 10.2270],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Phú Quốc — cát trắng, bãi Sao.",
  },
  {
    slug: "ba-ria-vt", name: "Bà Rịa — VT", region: "nam",
    center: [106.6094, 8.6916],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Côn Đảo — đảo biệt lập, lịch sử.",
  },
];

export const provinceBySlug = Object.fromEntries(provinces.map((p) => [p.slug, p]));
export const provinceByName = Object.fromEntries(provinces.map((p) => [p.name, p]));

export const provincesByRegion = Object.fromEntries(
  regions.map((r) => [r.key, provinces.filter((p) => p.region === r.key)])
) as Record<RegionKey, Province[]>;
