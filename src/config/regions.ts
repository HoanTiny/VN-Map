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
  {
    slug: "hoa-binh", name: "Hòa Bình", region: "bac",
    center: [105.3380, 20.8135],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Mai Châu, thung lũng xanh, homestay người Thái.",
  },
  {
    slug: "son-la", name: "Sơn La", region: "bac",
    center: [104.6766, 20.8380],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Mộc Châu — cao nguyên hoa cải, đồi chè xanh mướt.",
  },
  {
    slug: "dien-bien", name: "Điện Biên", region: "bac",
    center: [103.0166, 21.3861],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Điện Biên Phủ — chiến trường lịch sử hào hùng.",
  },

  // ── Miền Trung ───────────────────────────────────────────
  {
    slug: "quang-binh", name: "Quảng Bình", region: "trung",
    center: [106.2825, 17.5879],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Phong Nha — Kẻ Bàng, hang động lớn nhất thế giới.",
  },
  {
    slug: "thanh-hoa", name: "Thanh Hóa", region: "trung",
    center: [105.7769, 19.8073],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Sầm Sơn, Suối cá Cẩm Lương, Thành Nhà Hồ.",
  },
  {
    slug: "nghe-an", name: "Nghệ An", region: "trung",
    center: [105.6870, 18.6796],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Cửa Lò, quê Bác Hồ, ẩm thực xứ Nghệ.",
  },
  {
    slug: "ha-tinh", name: "Hà Tĩnh", region: "trung",
    center: [105.9057, 18.3607],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Biển Thiên Cầm, chùa Hương Tích, miền non nước.",
  },
  {
    slug: "quang-tri", name: "Quảng Trị", region: "trung",
    center: [107.1872, 16.7376],
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&q=80",
    tagline: "Địa đạo Vịnh Mốc, Cửa Tùng, di tích chiến tranh.",
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
    slug: "quang-ngai", name: "Quảng Ngãi", region: "trung",
    center: [108.7928, 15.1138],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Đảo Lý Sơn — tỏi tươi, biển hoang sơ ít người biết.",
  },
  {
    slug: "phu-yen", name: "Phú Yên", region: "trung",
    center: [109.0920, 13.0965],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Gành Đá Đĩa, Mũi Điện — cực đông Tổ quốc.",
  },
  {
    slug: "khanh-hoa", name: "Khánh Hoà", region: "trung",
    center: [109.1968, 12.2388],
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80",
    tagline: "Vịnh Nha Trang — lặn biển, tour đảo.",
  },
  {
    slug: "dak-lak", name: "Đắk Lắk", region: "trung",
    center: [108.0503, 12.6682],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Buôn Ma Thuột — cà phê nguyên bản, hồ Lak, thác Dray Nur.",
  },
  {
    slug: "gia-lai", name: "Gia Lai", region: "trung",
    center: [108.0000, 13.9833],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Biển Hồ T'nưng, cao nguyên xanh, văn hóa Jrai.",
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
    slug: "tay-ninh", name: "Tây Ninh", region: "nam",
    center: [106.0991, 11.3351],
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&q=80",
    tagline: "Núi Bà Đen, Toà Thánh Cao Đài — tâm linh miền Nam.",
  },
  {
    slug: "an-giang", name: "An Giang", region: "nam",
    center: [105.1258, 10.7078],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Châu Đốc, Núi Sam, mùa nước nổi đồng bằng.",
  },
  {
    slug: "ca-mau", name: "Cà Mau", region: "nam",
    center: [105.1500, 9.1769],
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80",
    tagline: "Mũi Cà Mau — cực Nam Tổ quốc, rừng đước U Minh.",
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

/**
 * Return the province whose center is closest (haversine) to the given coord.
 * Used by the map's "pick a location" flow to auto-fill the submission form.
 */
export function closestProvince(coord: [number, number]): Province {
  const [lng, lat] = coord;
  let best = provinces[0]!;
  let bestDist = Infinity;
  for (const p of provinces) {
    const dLng = p.center[0] - lng;
    const dLat = p.center[1] - lat;
    const d = dLng * dLng + dLat * dLat; // squared euclidean — fine for ranking
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}
