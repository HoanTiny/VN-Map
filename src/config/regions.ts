/**
 * Vietnam regions + provinces used by /region/* routes.
 *
 * Updated theo Nghị quyết 60-NQ/TW & Nghị quyết của Quốc hội về việc
 * sắp xếp đơn vị hành chính cấp tỉnh, hiệu lực 01/07/2025:
 *   - 6 thành phố trực thuộc Trung ương + 28 tỉnh = 34 đơn vị
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
  /** Optional — true cho 6 thành phố trực thuộc Trung ương. */
  isCity?: boolean;
  /** Danh sách tỉnh/TP cũ đã sáp nhập vào — dùng để hiển thị context lịch sử. */
  merged?: string[];
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
    description: "Di sản UNESCO, bãi biển dài, ẩm thực cố đô, Tây Nguyên đại ngàn.",
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

const UNSPLASH_MOUNTAIN = "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80";
const UNSPLASH_HERITAGE = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&q=80";
const UNSPLASH_BEACH = "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80";
const UNSPLASH_CITY = "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1400&q=80";
const UNSPLASH_HALONG = "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=1400&q=80";
const UNSPLASH_HCM = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&q=80";
const UNSPLASH_DANANG = "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1400&q=80";

export const provinces: Province[] = [
  // ═════════════════════ Miền Bắc (15 đơn vị) ═════════════════════

  // ── 6 TP TW (phần thuộc Bắc) ──
  {
    slug: "ha-noi", name: "Hà Nội", region: "bac", isCity: true,
    center: [105.8542, 21.0285], cover: UNSPLASH_CITY,
    tagline: "Thủ đô nghìn năm — phố cổ, cafe trứng, ẩm thực vỉa hè.",
  },
  {
    slug: "hai-phong", name: "Hải Phòng", region: "bac", isCity: true,
    merged: ["Hải Dương"],
    center: [106.6881, 20.8449], cover: UNSPLASH_BEACH,
    tagline: "Thành phố hoa phượng đỏ, cửa ngõ đảo Cát Bà — mở rộng sau khi hợp nhất Hải Dương.",
  },

  // ── 13 tỉnh Bắc ──
  {
    slug: "lai-chau", name: "Lai Châu", region: "bac",
    center: [103.4380, 22.3964], cover: UNSPLASH_MOUNTAIN,
    tagline: "Pu Ta Leng, Sìn Hồ — vùng cao Tây Bắc hùng vĩ.",
  },
  {
    slug: "dien-bien", name: "Điện Biên", region: "bac",
    center: [103.0166, 21.3861], cover: UNSPLASH_MOUNTAIN,
    tagline: "Điện Biên Phủ — chiến trường lịch sử hào hùng.",
  },
  {
    slug: "son-la", name: "Sơn La", region: "bac",
    center: [104.6766, 20.8380], cover: UNSPLASH_MOUNTAIN,
    tagline: "Mộc Châu — cao nguyên hoa cải, đồi chè xanh mướt.",
  },
  {
    slug: "lao-cai", name: "Lào Cai", region: "bac",
    merged: ["Yên Bái"],
    center: [103.9750, 22.4856], cover: UNSPLASH_MOUNTAIN,
    tagline: "Sa Pa, Fansipan, Mù Cang Chải — ruộng bậc thang nóc nhà Đông Dương.",
  },
  {
    slug: "tuyen-quang", name: "Tuyên Quang", region: "bac",
    merged: ["Hà Giang"],
    center: [105.2280, 21.8237], cover: UNSPLASH_MOUNTAIN,
    tagline: "Cao nguyên đá Đồng Văn, Tân Trào — vùng địa đầu mở rộng.",
  },
  {
    slug: "cao-bang", name: "Cao Bằng", region: "bac",
    center: [106.2520, 22.6651], cover: UNSPLASH_MOUNTAIN,
    tagline: "Thác Bản Giốc, Pác Bó — biên cương Đông Bắc.",
  },
  {
    slug: "lang-son", name: "Lạng Sơn", region: "bac",
    center: [106.7610, 21.8540], cover: UNSPLASH_MOUNTAIN,
    tagline: "Mẫu Sơn, ải Chi Lăng, chợ Đông Kinh — cửa khẩu biên giới.",
  },
  {
    slug: "thai-nguyen", name: "Thái Nguyên", region: "bac",
    merged: ["Bắc Kạn"],
    center: [105.8442, 21.5944], cover: UNSPLASH_MOUNTAIN,
    tagline: "Trà Tân Cương, hồ Ba Bể — vùng trung du mở rộng.",
  },
  {
    slug: "phu-tho", name: "Phú Thọ", region: "bac",
    merged: ["Vĩnh Phúc", "Hòa Bình"],
    center: [105.2178, 21.3989], cover: UNSPLASH_MOUNTAIN,
    tagline: "Đền Hùng, Mai Châu, Tam Đảo — cội nguồn dân tộc.",
  },
  {
    slug: "bac-ninh", name: "Bắc Ninh", region: "bac",
    merged: ["Bắc Giang"],
    center: [106.0763, 21.1861], cover: UNSPLASH_HERITAGE,
    tagline: "Quan họ, chùa Dâu, vải thiều Lục Ngạn — Kinh Bắc nghìn năm.",
  },
  {
    slug: "hung-yen", name: "Hưng Yên", region: "bac",
    merged: ["Thái Bình"],
    center: [106.0640, 20.6464], cover: UNSPLASH_HERITAGE,
    tagline: "Phố Hiến, chùa Keo — đồng bằng Bắc Bộ trù phú.",
  },
  {
    slug: "quang-ninh", name: "Quảng Ninh", region: "bac",
    center: [107.1839, 20.9101], cover: UNSPLASH_HALONG,
    tagline: "Vịnh Hạ Long — di sản thiên nhiên thế giới.",
  },
  {
    slug: "ninh-binh", name: "Ninh Bình", region: "bac",
    merged: ["Hà Nam", "Nam Định"],
    center: [105.9744, 20.2506], cover: UNSPLASH_MOUNTAIN,
    tagline: "Tràng An, Tam Cốc, đền Trần — danh thắng UNESCO.",
  },

  // ═════════════════════ Miền Trung (11 đơn vị) ═════════════════════

  // ── 2 TP TW ──
  {
    slug: "hue", name: "Huế", region: "trung", isCity: true,
    merged: ["Thừa Thiên Huế"],
    center: [107.5909, 16.4637], cover: UNSPLASH_HERITAGE,
    tagline: "Cố đô — Đại Nội, bún bò, áo dài.",
  },
  {
    slug: "da-nang", name: "Đà Nẵng", region: "trung", isCity: true,
    merged: ["Quảng Nam"],
    center: [108.2022, 16.0544], cover: UNSPLASH_DANANG,
    tagline: "Biển Mỹ Khê, cầu Vàng, Hội An, Mỹ Sơn — mở rộng tới Quảng Nam.",
  },

  // ── 9 tỉnh Trung ──
  {
    slug: "thanh-hoa", name: "Thanh Hóa", region: "trung",
    center: [105.7769, 19.8073], cover: UNSPLASH_BEACH,
    tagline: "Sầm Sơn, Suối cá Cẩm Lương, Thành Nhà Hồ.",
  },
  {
    slug: "nghe-an", name: "Nghệ An", region: "trung",
    center: [105.6870, 18.6796], cover: UNSPLASH_BEACH,
    tagline: "Cửa Lò, quê Bác Hồ, ẩm thực xứ Nghệ.",
  },
  {
    slug: "ha-tinh", name: "Hà Tĩnh", region: "trung",
    center: [105.9057, 18.3607], cover: UNSPLASH_BEACH,
    tagline: "Biển Thiên Cầm, chùa Hương Tích, miền non nước.",
  },
  {
    slug: "quang-tri", name: "Quảng Trị", region: "trung",
    merged: ["Quảng Bình"],
    center: [107.1872, 16.7376], cover: UNSPLASH_HERITAGE,
    tagline: "Phong Nha — Kẻ Bàng, địa đạo Vịnh Mốc — di sản hang động & lịch sử.",
  },
  {
    slug: "quang-ngai", name: "Quảng Ngãi", region: "trung",
    merged: ["Kon Tum"],
    center: [108.7928, 15.1138], cover: UNSPLASH_BEACH,
    tagline: "Đảo Lý Sơn, Măng Đen, Ngọc Linh — biển đảo & đại ngàn.",
  },
  {
    slug: "gia-lai", name: "Gia Lai", region: "trung",
    merged: ["Bình Định"],
    center: [108.0000, 13.9833], cover: UNSPLASH_MOUNTAIN,
    tagline: "Biển Hồ T'nưng, Quy Nhơn, Eo Gió — Tây Nguyên ra biển.",
  },
  {
    slug: "dak-lak", name: "Đắk Lắk", region: "trung",
    merged: ["Phú Yên"],
    center: [108.0503, 12.6682], cover: UNSPLASH_MOUNTAIN,
    tagline: "Buôn Ma Thuột, Gành Đá Đĩa, Mũi Điện — cà phê & cực Đông.",
  },
  {
    slug: "khanh-hoa", name: "Khánh Hòa", region: "trung",
    merged: ["Ninh Thuận"],
    center: [109.1968, 12.2388], cover: UNSPLASH_BEACH,
    tagline: "Vịnh Nha Trang, Phan Rang — lặn biển, tour đảo.",
  },
  {
    slug: "lam-dong", name: "Lâm Đồng", region: "trung",
    merged: ["Đắk Nông", "Bình Thuận"],
    center: [108.4583, 11.9404], cover: UNSPLASH_HERITAGE,
    tagline: "Đà Lạt, Mũi Né, thác Dray Sap — sương mù & cát bay.",
  },

  // ═════════════════════ Miền Nam (8 đơn vị) ═════════════════════

  // ── 2 TP TW ──
  {
    slug: "tp-hcm", name: "TP. HCM", region: "nam", isCity: true,
    merged: ["Bình Dương", "Bà Rịa - Vũng Tàu"],
    center: [106.7009, 10.7769], cover: UNSPLASH_HCM,
    tagline: "Sài Gòn — bánh mì, rooftop, speakeasy; mở rộng đến Vũng Tàu, Côn Đảo.",
  },
  {
    slug: "can-tho", name: "Cần Thơ", region: "nam", isCity: true,
    merged: ["Sóc Trăng", "Hậu Giang"],
    center: [105.7469, 10.0452], cover: UNSPLASH_MOUNTAIN,
    tagline: "Mekong — chợ nổi Cái Răng, chùa Khmer, vườn cây trái.",
  },

  // ── 6 tỉnh Nam ──
  {
    slug: "tay-ninh", name: "Tây Ninh", region: "nam",
    merged: ["Long An"],
    center: [106.0991, 11.3351], cover: UNSPLASH_HERITAGE,
    tagline: "Núi Bà Đen, Toà Thánh Cao Đài — tâm linh miền Nam.",
  },
  {
    slug: "dong-nai", name: "Đồng Nai", region: "nam",
    merged: ["Bình Phước"],
    center: [106.8225, 11.0686], cover: UNSPLASH_MOUNTAIN,
    tagline: "Cát Tiên, Trị An — rừng quốc gia & hồ thuỷ điện.",
  },
  {
    slug: "vinh-long", name: "Vĩnh Long", region: "nam",
    merged: ["Bến Tre", "Trà Vinh"],
    center: [105.9722, 10.2536], cover: UNSPLASH_MOUNTAIN,
    tagline: "Xứ dừa Bến Tre, chùa Khmer Trà Vinh — miền Tây sông nước.",
  },
  {
    slug: "dong-thap", name: "Đồng Tháp", region: "nam",
    merged: ["Tiền Giang"],
    center: [105.6361, 10.4938], cover: UNSPLASH_MOUNTAIN,
    tagline: "Sa Đéc làng hoa, Tràm Chim, Cái Bè — sen & sông Tiền.",
  },
  {
    slug: "an-giang", name: "An Giang", region: "nam",
    merged: ["Kiên Giang"],
    center: [105.1258, 10.7078], cover: UNSPLASH_MOUNTAIN,
    tagline: "Châu Đốc, Núi Sam, Phú Quốc, Hà Tiên — biên giới Tây Nam ra biển.",
  },
  {
    slug: "ca-mau", name: "Cà Mau", region: "nam",
    merged: ["Bạc Liêu"],
    center: [105.1500, 9.1769], cover: UNSPLASH_MOUNTAIN,
    tagline: "Mũi Cà Mau, U Minh Hạ, Bạc Liêu — cực Nam Tổ quốc.",
  },
];

export const provinceBySlug = Object.fromEntries(provinces.map((p) => [p.slug, p]));
export const provinceByName = Object.fromEntries(provinces.map((p) => [p.name, p]));

export const provincesByRegion = Object.fromEntries(
  regions.map((r) => [r.key, provinces.filter((p) => p.region === r.key)])
) as Record<RegionKey, Province[]>;

/**
 * Mapping tỉnh/TP cũ → đơn vị mới (slug).
 * Dùng để remap dữ liệu cũ (place.province) sau Nghị quyết 01/07/2025.
 * Bao gồm cả các tên hiện hành (Hà Nội → ha-noi) để chuyển đổi an toàn.
 */
export const legacyProvinceMap: Record<string, string> = {
  // Giữ nguyên — không đổi
  "Hà Nội": "ha-noi",
  "Hải Phòng": "hai-phong",
  "Đà Nẵng": "da-nang",
  "TP. HCM": "tp-hcm",
  "TP.HCM": "tp-hcm",
  "Hồ Chí Minh": "tp-hcm",
  "Cần Thơ": "can-tho",
  "Lai Châu": "lai-chau",
  "Điện Biên": "dien-bien",
  "Sơn La": "son-la",
  "Lào Cai": "lao-cai",
  "Tuyên Quang": "tuyen-quang",
  "Cao Bằng": "cao-bang",
  "Lạng Sơn": "lang-son",
  "Thái Nguyên": "thai-nguyen",
  "Phú Thọ": "phu-tho",
  "Bắc Ninh": "bac-ninh",
  "Hưng Yên": "hung-yen",
  "Quảng Ninh": "quang-ninh",
  "Ninh Bình": "ninh-binh",
  "Thanh Hóa": "thanh-hoa",
  "Nghệ An": "nghe-an",
  "Hà Tĩnh": "ha-tinh",
  "Quảng Trị": "quang-tri",
  "Quảng Ngãi": "quang-ngai",
  "Gia Lai": "gia-lai",
  "Đắk Lắk": "dak-lak",
  "Khánh Hòa": "khanh-hoa",
  "Khánh Hoà": "khanh-hoa",
  "Lâm Đồng": "lam-dong",
  "Tây Ninh": "tay-ninh",
  "Đồng Nai": "dong-nai",
  "Vĩnh Long": "vinh-long",
  "Đồng Tháp": "dong-thap",
  "An Giang": "an-giang",
  "Cà Mau": "ca-mau",
  "Huế": "hue",

  // Đã sáp nhập — map đến tỉnh/TP mới
  "Hải Dương": "hai-phong",
  "Yên Bái": "lao-cai",
  "Hà Giang": "tuyen-quang",
  "Bắc Kạn": "thai-nguyen",
  "Vĩnh Phúc": "phu-tho",
  "Hòa Bình": "phu-tho",
  "Hoà Bình": "phu-tho",
  "Bắc Giang": "bac-ninh",
  "Thái Bình": "hung-yen",
  "Hà Nam": "ninh-binh",
  "Nam Định": "ninh-binh",
  "Thừa Thiên Huế": "hue",
  "Quảng Nam": "da-nang",
  "Quảng Bình": "quang-tri",
  "Kon Tum": "quang-ngai",
  "Bình Định": "gia-lai",
  "Phú Yên": "dak-lak",
  "Ninh Thuận": "khanh-hoa",
  "Đắk Nông": "lam-dong",
  "Bình Thuận": "lam-dong",
  "Bình Dương": "tp-hcm",
  "Bà Rịa - Vũng Tàu": "tp-hcm",
  "Bà Rịa — VT": "tp-hcm",
  "Bà Rịa-VT": "tp-hcm",
  "Vũng Tàu": "tp-hcm",
  "Bình Phước": "dong-nai",
  "Long An": "tay-ninh",
  "Bến Tre": "vinh-long",
  "Trà Vinh": "vinh-long",
  "Tiền Giang": "dong-thap",
  "Kiên Giang": "an-giang",
  "Sóc Trăng": "can-tho",
  "Hậu Giang": "can-tho",
  "Bạc Liêu": "ca-mau",
};

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
