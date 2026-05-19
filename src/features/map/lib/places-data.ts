import type { CategoryKey } from "@/config/categories";

export type PriceRange = "$" | "$$" | "$$$" | "$$$$";
export type PlaceSource = "seed" | "community";

export interface PlaceFeatureProps {
  id: string;
  slug: string;
  name: string;
  province: string;
  district?: string;
  address?: string;
  category: CategoryKey;
  cover: string;
  rating: number;
  reviewCount: number;
  highlight?: string;
  priceRange?: PriceRange;
  openingHours?: string;
  tags?: string[];
  source: PlaceSource;
  submittedBy?: string;
}

export interface PlaceFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: PlaceFeatureProps;
}

export interface PlacesFC {
  type: "FeatureCollection";
  features: PlaceFeature[];
}

const RAW: Array<PlaceFeatureProps & { lng: number; lat: number }> = [
  /* ═══════════════════════════════════════════ Bắc ═══════════════════════════════════════════ */
  {
    id: "1", slug: "sa-pa", name: "Sa Pa", province: "Lào Cai", category: "mountain",
    lng: 103.8438, lat: 22.3364, rating: 4.8, reviewCount: 3940,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Ruộng bậc thang mùa lúa chín",
    tags: ["mây bay", "trekking", "tháng-9-10"], source: "seed",
  },
  {
    id: "2", slug: "ha-giang", name: "Cao nguyên đá Hà Giang", province: "Hà Giang", category: "mountain",
    lng: 104.9836, lat: 22.8233, rating: 4.9, reviewCount: 2820,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Cung Hà Giang Loop",
    tags: ["motorbike", "loop", "Đồng-Văn"], source: "seed",
  },
  {
    id: "3", slug: "mu-cang-chai", name: "Mù Cang Chải", province: "Yên Bái", category: "mountain",
    lng: 104.0894, lat: 21.8489, rating: 4.7, reviewCount: 1450,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    tags: ["ruộng-bậc-thang"], source: "seed",
  },
  {
    id: "4", slug: "hanoi-old-quarter", name: "Phố cổ Hà Nội", province: "Hà Nội", district: "Hoàn Kiếm",
    address: "36 phố phường, Hoàn Kiếm, Hà Nội",
    category: "heritage", lng: 105.8542, lat: 21.0285, rating: 4.6, reviewCount: 6210,
    cover: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=900&q=80",
    tags: ["walking", "lịch-sử"], openingHours: "Mở cả ngày",
    source: "seed",
  },
  {
    id: "5", slug: "pho-bat-dan", name: "Phở Bát Đàn", province: "Hà Nội", district: "Hoàn Kiếm",
    address: "49 Bát Đàn, Hoàn Kiếm, Hà Nội", category: "food",
    lng: 105.8480, lat: 21.0345, rating: 4.6, reviewCount: 980,
    cover: "https://images.unsplash.com/photo-1583224944844-5b268c057b72?w=900&q=80",
    highlight: "Phở bò gia truyền 4 thế hệ",
    priceRange: "$", openingHours: "06:00–10:30 & 18:00–20:30",
    tags: ["phở-bò", "gia-truyền", "địa-phương"], source: "seed",
  },
  {
    id: "6", slug: "cafe-giang", name: "Cafe Giảng — Cafe trứng",
    province: "Hà Nội", district: "Hoàn Kiếm",
    address: "39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội",
    category: "cafe", lng: 105.8556, lat: 21.0334, rating: 4.7, reviewCount: 4820,
    cover: "https://images.unsplash.com/photo-1559496417-e7f25cb247cd?w=900&q=80",
    highlight: "Cafe trứng nguyên bản từ 1946",
    priceRange: "$", openingHours: "07:00–22:00",
    tags: ["cafe-trứng", "đặc-sản", "phố-cổ"], source: "seed",
  },
  {
    id: "7", slug: "ne-cocktail-bar", name: "Nê Cocktail Bar",
    province: "Hà Nội", district: "Hoàn Kiếm",
    address: "3B Tống Duy Tân, Hoàn Kiếm, Hà Nội",
    category: "nightlife", lng: 105.8456, lat: 21.0291, rating: 4.8, reviewCount: 1320,
    cover: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=900&q=80",
    highlight: "Pho cocktail — sáng tạo địa phương",
    priceRange: "$$$", openingHours: "18:00–01:00",
    tags: ["cocktail", "speakeasy", "signature"], source: "seed",
  },
  {
    id: "8", slug: "twilight-sky-bar", name: "Twilight Sky Bar",
    province: "Hà Nội", district: "Ba Đình",
    address: "Lotte Center, 54 Liễu Giai, Ba Đình",
    category: "rooftop", lng: 105.8132, lat: 21.0337, rating: 4.6, reviewCount: 2410,
    cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=80",
    highlight: "View toàn cảnh Hà Nội tầng 65",
    priceRange: "$$$$", openingHours: "17:00–01:00",
    tags: ["view", "sunset", "tầng-65"], source: "seed",
  },
  {
    id: "9", slug: "long-bien-bridge", name: "Cầu Long Biên",
    province: "Hà Nội", district: "Long Biên",
    category: "checkin", lng: 105.8642, lat: 21.0445, rating: 4.5, reviewCount: 3210,
    cover: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=900&q=80",
    highlight: "Cầu thép Pháp 1902 — sunset ảnh đẹp",
    openingHours: "Mở cả ngày",
    tags: ["lịch-sử", "sunset", "vintage"], source: "seed",
  },
  {
    id: "10", slug: "ha-long-bay", name: "Vịnh Hạ Long",
    province: "Quảng Ninh", category: "nature",
    lng: 107.1839, lat: 20.9101, rating: 4.8, reviewCount: 5180,
    cover: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=900&q=80",
    priceRange: "$$$", tags: ["UNESCO", "kayak", "du-thuyền"], source: "seed",
  },
  {
    id: "11", slug: "cat-ba", name: "Đảo Cát Bà", province: "Hải Phòng",
    category: "beach", lng: 107.0500, lat: 20.7167, rating: 4.5, reviewCount: 1820,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["đảo", "leo-núi", "yên-tĩnh"], source: "seed",
  },
  {
    id: "12", slug: "ninh-binh", name: "Tam Cốc Ninh Bình",
    province: "Ninh Bình", category: "nature",
    lng: 105.9744, lat: 20.2506, rating: 4.8, reviewCount: 1820,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Vịnh Hạ Long trên cạn",
    priceRange: "$$", tags: ["thuyền", "núi-đá-vôi"], source: "seed",
  },
  {
    id: "13", slug: "ba-be-lake", name: "Hồ Ba Bể",
    province: "Bắc Kạn", category: "hidden",
    lng: 105.6244, lat: 22.4081, rating: 4.6, reviewCount: 720,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Hồ nước ngọt nguyên sinh — ít người biết",
    tags: ["off-the-beaten", "homestay-Tày"], source: "seed",
  },

  /* ═══════════════════════════════════════════ Trung ═══════════════════════════════════════════ */
  {
    id: "14", slug: "phong-nha", name: "Phong Nha — Kẻ Bàng",
    province: "Quảng Bình", category: "nature",
    lng: 106.2825, lat: 17.5879, rating: 4.9, reviewCount: 2410,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Hệ thống hang động lớn nhất thế giới",
    priceRange: "$$$", tags: ["UNESCO", "hang-động", "Sơn-Đoòng"], source: "seed",
  },
  {
    id: "15", slug: "hue-imperial", name: "Đại Nội Huế",
    province: "Thừa Thiên Huế", district: "Phú Xuân",
    category: "heritage", lng: 107.5909, lat: 16.4637, rating: 4.7, reviewCount: 2640,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    priceRange: "$$", openingHours: "06:30–17:30",
    tags: ["UNESCO", "triều-Nguyễn"], source: "seed",
  },
  {
    id: "16", slug: "bun-bo-hue", name: "Bún bò bà Phụng",
    province: "Thừa Thiên Huế", district: "Phú Xuân",
    address: "14 Nguyễn Du, Huế", category: "food",
    lng: 107.5821, lat: 16.4675, rating: 4.5, reviewCount: 510,
    cover: "https://images.unsplash.com/photo-1583224944844-5b268c057b72?w=900&q=80",
    priceRange: "$", openingHours: "06:00–10:00",
    tags: ["bún-bò", "bữa-sáng"], source: "seed",
  },
  {
    id: "17", slug: "danang-my-khe", name: "Biển Mỹ Khê",
    province: "Đà Nẵng", category: "beach",
    lng: 108.2480, lat: 16.0594, rating: 4.7, reviewCount: 3010,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["surf", "sunrise", "biển"], source: "seed",
  },
  {
    id: "18", slug: "danang-city", name: "Đà Nẵng",
    province: "Đà Nẵng", category: "city",
    lng: 108.2022, lat: 16.0544, rating: 4.6, reviewCount: 4180,
    cover: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&q=80",
    highlight: "Sông Hàn, cầu Rồng, biển Mỹ Khê",
    tags: ["sông-Hàn"], source: "seed",
  },
  {
    id: "19", slug: "sky36-da-nang", name: "Sky36 Rooftop",
    province: "Đà Nẵng", district: "Hải Châu",
    address: "Novotel Đà Nẵng, 36 Bạch Đằng",
    category: "rooftop", lng: 108.2253, lat: 16.0750, rating: 4.5, reviewCount: 1820,
    cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=80",
    highlight: "View sông Hàn & cầu Rồng tầng 36",
    priceRange: "$$$$", openingHours: "18:00–02:00",
    tags: ["sky-bar", "view-sông", "Đà-Nẵng"], source: "seed",
  },
  {
    id: "20", slug: "my-son", name: "Thánh địa Mỹ Sơn",
    province: "Quảng Nam", category: "heritage",
    lng: 108.1241, lat: 15.7637, rating: 4.6, reviewCount: 1240,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    priceRange: "$$", tags: ["UNESCO", "Chăm-pa"], source: "seed",
  },
  {
    id: "21", slug: "hoi-an", name: "Phố cổ Hội An",
    province: "Quảng Nam", district: "Minh An",
    category: "heritage", lng: 108.3380, lat: 15.8801, rating: 4.9, reviewCount: 2420,
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=80",
    highlight: "Đèn lồng rực rỡ về đêm",
    priceRange: "$$", openingHours: "Mở cả ngày",
    tags: ["UNESCO", "đèn-lồng", "may-đo"], source: "seed",
  },
  {
    id: "22", slug: "hoi-an-lantern-alley", name: "Hẻm đèn lồng Hội An",
    province: "Quảng Nam", district: "Minh An",
    category: "checkin", lng: 108.3268, lat: 15.8770, rating: 4.7, reviewCount: 1980,
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=80",
    highlight: "Spot chụp đèn lồng nổi tiếng",
    tags: ["đèn-lồng", "đêm", "instagram"], source: "seed",
  },
  {
    id: "23", slug: "reaching-out-tea", name: "Reaching Out Tea House",
    province: "Quảng Nam", district: "Minh An",
    address: "131 Trần Phú, Hội An",
    category: "cafe", lng: 108.3270, lat: 15.8772, rating: 4.9, reviewCount: 2140,
    cover: "https://images.unsplash.com/photo-1559496417-e7f25cb247cd?w=900&q=80",
    highlight: "Trà thất do người khiếm thính phục vụ — yên lặng tuyệt đối",
    priceRange: "$$", openingHours: "10:00–20:30",
    tags: ["trà", "yên-lặng", "social-impact"], source: "seed",
  },
  {
    id: "24", slug: "an-bang-beach", name: "Bãi An Bàng",
    province: "Quảng Nam", category: "beach",
    lng: 108.3460, lat: 15.9180, rating: 4.6, reviewCount: 1380,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["beach-bar", "sunset"], source: "seed",
  },
  {
    id: "25", slug: "hoi-an-lantern-workshop", name: "Lớp làm đèn lồng Hội An",
    province: "Quảng Nam", district: "Minh An",
    category: "experience", lng: 108.3290, lat: 15.8795, rating: 4.8, reviewCount: 920,
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=80",
    highlight: "Tự tay làm đèn lồng — mang về",
    priceRange: "$$", openingHours: "09:00–18:00",
    tags: ["workshop", "thủ-công", "family-friendly"], source: "seed",
  },
  {
    id: "26", slug: "quy-nhon", name: "Eo gió Quy Nhơn",
    province: "Bình Định", category: "beach",
    lng: 109.2197, lat: 13.7820, rating: 4.6, reviewCount: 1190,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["off-the-beaten"], source: "seed",
  },
  {
    id: "27", slug: "nha-trang", name: "Vịnh Nha Trang",
    province: "Khánh Hoà", category: "beach",
    lng: 109.1968, lat: 12.2388, rating: 4.5, reviewCount: 4290,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["lặn-biển", "tour-đảo"], source: "seed",
  },

  /* ═══════════════════════════════════════════ Nam ═══════════════════════════════════════════ */
  {
    id: "28", slug: "da-lat", name: "Đà Lạt",
    province: "Lâm Đồng", category: "city",
    lng: 108.4583, lat: 11.9404, rating: 4.7, reviewCount: 3120,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Sương mù & rừng thông",
    tags: ["mát", "couple"], source: "seed",
  },
  {
    id: "29", slug: "tui-mo-to-dalat", name: "Túi Mơ To",
    province: "Lâm Đồng", district: "Đà Lạt",
    address: "57 Đường Phù Đổng Thiên Vương",
    category: "cafe", lng: 108.4380, lat: 11.9580, rating: 4.6, reviewCount: 1320,
    cover: "https://images.unsplash.com/photo-1559496417-e7f25cb247cd?w=900&q=80",
    highlight: "Cafe rừng thông — vibe Đà Lạt nguyên bản",
    priceRange: "$$", openingHours: "07:00–22:00",
    tags: ["view-rừng", "indie", "couple"], source: "seed",
  },
  {
    id: "30", slug: "mui-ne", name: "Mũi Né",
    province: "Bình Thuận", category: "beach",
    lng: 108.2902, lat: 10.9418, rating: 4.5, reviewCount: 2080,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["đồi-cát", "kite-surf"], source: "seed",
  },
  {
    id: "31", slug: "sai-gon", name: "TP. Hồ Chí Minh",
    province: "TP. HCM", category: "city",
    lng: 106.7009, lat: 10.7769, rating: 4.6, reviewCount: 7290,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    tags: ["nightlife", "ẩm-thực"], source: "seed",
  },
  {
    id: "32", slug: "com-tam-ba-ghien", name: "Cơm tấm Ba Ghiền",
    province: "TP. HCM", district: "Quận 3",
    address: "84 Đặng Văn Ngữ, Phú Nhuận, TP.HCM",
    category: "food", lng: 106.6889, lat: 10.7826, rating: 4.5, reviewCount: 1820,
    cover: "https://images.unsplash.com/photo-1583224944844-5b268c057b72?w=900&q=80",
    highlight: "Sườn nướng lớn nhất Sài Gòn",
    priceRange: "$$", openingHours: "07:00–21:00",
    tags: ["cơm-tấm", "sườn-nướng"], source: "seed",
  },
  {
    id: "33", slug: "the-workshop-coffee", name: "The Workshop Coffee",
    province: "TP. HCM", district: "Quận 1",
    address: "27 Ngô Đức Kế, Quận 1",
    category: "cafe", lng: 106.7042, lat: 10.7723, rating: 4.7, reviewCount: 3210,
    cover: "https://images.unsplash.com/photo-1559496417-e7f25cb247cd?w=900&q=80",
    highlight: "Third-wave coffee — rang tại chỗ",
    priceRange: "$$", openingHours: "08:00–21:00",
    tags: ["specialty", "rang-xay", "industrial"], source: "seed",
  },
  {
    id: "34", slug: "social-club-saigon", name: "Social Club Rooftop",
    province: "TP. HCM", district: "Quận 1",
    address: "MGallery 76 Lê Lai, Quận 1",
    category: "rooftop", lng: 106.6918, lat: 10.7702, rating: 4.7, reviewCount: 2410,
    cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=80",
    highlight: "Pool rooftop tầng 23 — view Bến Thành",
    priceRange: "$$$$", openingHours: "16:00–01:00",
    tags: ["pool", "view-trung-tâm"], source: "seed",
  },
  {
    id: "35", slug: "snuffbox-saigon", name: "Snuffbox",
    province: "TP. HCM", district: "Quận 1",
    address: "Bí mật — DM Instagram để biết địa chỉ",
    category: "hidden", lng: 106.6987, lat: 10.7734, rating: 4.8, reviewCount: 680,
    cover: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=900&q=80",
    highlight: "Speakeasy bar ẩn — DM để biết địa chỉ",
    priceRange: "$$$", openingHours: "19:00–02:00",
    tags: ["speakeasy", "secret", "cocktail"], source: "seed",
  },
  {
    id: "36", slug: "buimi-huynh-hoa", name: "Bánh mì Huỳnh Hoa",
    province: "TP. HCM", district: "Quận 1",
    address: "26 Lê Thị Riêng, Quận 1",
    category: "food", lng: 106.6920, lat: 10.7716, rating: 4.7, reviewCount: 4820,
    cover: "https://images.unsplash.com/photo-1583224944844-5b268c057b72?w=900&q=80",
    highlight: "Bánh mì đầy thịt nguội & pate — Sài Gòn",
    priceRange: "$", openingHours: "06:00–22:00",
    tags: ["bánh-mì", "iconic", "street-food"], source: "seed",
  },
  {
    id: "37", slug: "nha-tho-duc-ba", name: "Nhà thờ Đức Bà",
    province: "TP. HCM", district: "Quận 1",
    category: "checkin", lng: 106.6993, lat: 10.7798, rating: 4.6, reviewCount: 5210,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Spot check-in Sài Gòn cổ điển",
    openingHours: "Bên ngoài mở cả ngày",
    tags: ["pháp-thuộc", "instagram"], source: "seed",
  },
  {
    id: "38", slug: "mekong-delta", name: "Mekong — chợ nổi Cái Răng",
    province: "Cần Thơ", category: "experience",
    lng: 105.7469, lat: 10.0452, rating: 4.5, reviewCount: 1410,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Tour chợ nổi sáng sớm",
    priceRange: "$$", tags: ["chợ-nổi", "thuyền", "miền-Tây"], source: "seed",
  },
  {
    id: "39", slug: "phu-quoc", name: "Bãi Sao Phú Quốc",
    province: "Kiên Giang", category: "beach",
    lng: 103.9670, lat: 10.2270, rating: 4.7, reviewCount: 2180,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["cát-trắng", "yên-tĩnh"], source: "seed",
  },
  {
    id: "40", slug: "con-dao", name: "Côn Đảo",
    province: "Bà Rịa — VT", category: "beach",
    lng: 106.6094, lat: 8.6916, rating: 4.8, reviewCount: 1620,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Đảo biệt lập — lịch sử & biển hoang sơ",
    priceRange: "$$$", tags: ["lịch-sử", "lặn-biển", "off-the-beaten"], source: "seed",
  },
];

export const placesData: PlacesFC = {
  type: "FeatureCollection",
  features: RAW.map(({ lng, lat, ...rest }) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [lng, lat] },
    properties: rest,
  })),
};

export const placesById = Object.fromEntries(
  RAW.map((p) => [p.id, { ...p, coordinates: [p.lng, p.lat] as [number, number] }])
);

export type PlaceItem = (typeof RAW)[number] & { coordinates: [number, number] };

export const allPlaces: PlaceItem[] = RAW.map(({ lng, lat, ...rest }) => ({
  ...rest,
  lng,
  lat,
  coordinates: [lng, lat],
}));

export function getPlaceBySlug(slug: string): PlaceItem | undefined {
  return allPlaces.find((p) => p.slug === slug);
}

/** Haversine distance in km between two [lng, lat] pairs. */
function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function getNearbyPlaces(
  slug: string,
  opts: { radiusKm?: number; limit?: number; sameCategoryFirst?: boolean } = {}
): PlaceItem[] {
  const { radiusKm = 50, limit = 6, sameCategoryFirst = true } = opts;
  const origin = getPlaceBySlug(slug);
  if (!origin) return [];
  const others = allPlaces
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, d: haversineKm(origin.coordinates, p.coordinates) }))
    .filter(({ d }) => d <= radiusKm);

  if (sameCategoryFirst) {
    others.sort((a, b) => {
      const aSame = a.p.category === origin.category ? 0 : 1;
      const bSame = b.p.category === origin.category ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
      return a.d - b.d;
    });
  } else {
    others.sort((a, b) => a.d - b.d);
  }
  return others.slice(0, limit).map(({ p }) => p);
}
