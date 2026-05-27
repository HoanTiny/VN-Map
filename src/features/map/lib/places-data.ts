import type { CategoryKey } from "@/config/categories";

export type PriceRange = "$" | "$$" | "$$$" | "$$$$";
export type PlaceSource = "seed" | "community";

export interface PlaceFeatureProps {
  id: string;
  slug: string;
  name: string;
  /** Optional English name — falls back to `name` when absent. Resolved by query layer. */
  nameEn?: string;
  province: string;
  district?: string;
  address?: string;
  category: CategoryKey;
  cover: string;
  rating: number;
  reviewCount: number;
  highlight?: string;
  /** Optional English highlight — falls back to `highlight`. */
  highlightEn?: string;
  /** Optional English long description. */
  descriptionEn?: string;
  priceRange?: PriceRange;
  openingHours?: string;
  tags?: string[];
  source: PlaceSource;
  submittedBy?: string;
  photos?: string[];
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
    id: "2", slug: "ha-giang", name: "Cao nguyên đá Hà Giang", province: "Tuyên Quang", district: "Đồng Văn (Hà Giang cũ)", category: "mountain",
    lng: 104.9836, lat: 22.8233, rating: 4.9, reviewCount: 2820,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Cung Hà Giang Loop",
    tags: ["motorbike", "loop", "Đồng-Văn"], source: "seed",
  },
  {
    id: "3", slug: "mu-cang-chai", name: "Mù Cang Chải", province: "Lào Cai", district: "Mù Cang Chải (Yên Bái cũ)", category: "mountain",
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
    cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=80",
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
    province: "Thái Nguyên", district: "Ba Bể (Bắc Kạn cũ)", category: "hidden",
    lng: 105.6244, lat: 22.4081, rating: 4.6, reviewCount: 720,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Hồ nước ngọt nguyên sinh — ít người biết",
    tags: ["off-the-beaten", "homestay-Tày"], source: "seed",
  },
  // ── Hòa Bình ──
  {
    id: "41", slug: "mai-chau-valley", name: "Thung lũng Mai Châu",
    province: "Phú Thọ", district: "Mai Châu (Hòa Bình cũ)", category: "mountain",
    lng: 104.8380, lat: 20.6480, rating: 4.7, reviewCount: 1840,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Thung lũng xanh — homestay người Thái bản Lác",
    tags: ["homestay", "ruộng-bậc-thang", "trekking"], source: "seed",
  },
  {
    id: "42", slug: "ban-lac-homestay", name: "Bản Lác",
    province: "Phú Thọ", district: "Mai Châu (Hòa Bình cũ)", category: "experience",
    lng: 104.8295, lat: 20.6440, rating: 4.6, reviewCount: 920,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Nhà sàn người Thái trắng — đêm lửa trại",
    priceRange: "$$", openingHours: "Nhận khách cả ngày",
    tags: ["nhà-sàn", "văn-hóa-Thái", "family-friendly"], source: "seed",
  },
  // ── Sơn La ──
  {
    id: "43", slug: "moc-chau-plateau", name: "Cao nguyên Mộc Châu",
    province: "Sơn La", category: "nature",
    lng: 104.6766, lat: 20.8380, rating: 4.7, reviewCount: 2140,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Hoa cải trắng tháng 11-12, đồi chè xanh mướt",
    tags: ["hoa-cải", "đồi-chè", "tháng-11-12"], source: "seed",
  },
  {
    id: "44", slug: "moc-chau-tea-hill", name: "Đồi chè Mộc Châu",
    province: "Sơn La", category: "checkin",
    lng: 104.6540, lat: 20.8220, rating: 4.5, reviewCount: 1180,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Check-in đồi chè xanh bát ngát",
    tags: ["đồi-chè", "instagram", "couple"], source: "seed",
  },
  // ── Điện Biên ──
  {
    id: "45", slug: "dien-bien-phu-battlefield", name: "Chiến trường Điện Biên Phủ",
    province: "Điện Biên", category: "heritage",
    lng: 103.0166, lat: 21.3861, rating: 4.7, reviewCount: 1560,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Di tích lịch sử Điện Biên Phủ 1954",
    priceRange: "$", openingHours: "07:00–17:00",
    tags: ["lịch-sử", "di-tích", "UNESCO"], source: "seed",
  },
  {
    id: "46", slug: "ham-de-castries", name: "Hầm Đờ Cát",
    province: "Điện Biên", category: "heritage",
    lng: 103.0128, lat: 21.3892, rating: 4.5, reviewCount: 720,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Hầm chỉ huy quân Pháp — nơi ký kết đầu hàng",
    priceRange: "$", openingHours: "07:00–17:00",
    tags: ["lịch-sử", "chiến-tranh"], source: "seed",
  },

  /* ═══════════════════════════════════════════ Trung ═══════════════════════════════════════════ */
  {
    id: "14", slug: "phong-nha", name: "Phong Nha — Kẻ Bàng",
    province: "Quảng Trị", district: "Bố Trạch (Quảng Bình cũ)", category: "nature",
    lng: 106.2825, lat: 17.5879, rating: 4.9, reviewCount: 2410,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Hệ thống hang động lớn nhất thế giới",
    priceRange: "$$$", tags: ["UNESCO", "hang-động", "Sơn-Đoòng"], source: "seed",
  },
  // ── Thanh Hóa ──
  {
    id: "47", slug: "suoi-ca-cam-luong", name: "Suối cá thần Cẩm Lương",
    province: "Thanh Hóa", category: "nature",
    lng: 105.4230, lat: 20.2830, rating: 4.5, reviewCount: 890,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Suối cá chép thần — nước trong vắt không ai dám bắt",
    priceRange: "$", tags: ["thiên-nhiên", "huyền-bí", "off-the-beaten"], source: "seed",
  },
  {
    id: "48", slug: "sam-son-beach", name: "Biển Sầm Sơn",
    province: "Thanh Hóa", category: "beach",
    lng: 105.9024, lat: 19.7371, rating: 4.3, reviewCount: 2840,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Bãi biển lớn nhất miền Bắc Trung Bộ",
    tags: ["biển", "gia-đình"], source: "seed",
  },
  {
    id: "49", slug: "thanh-nha-ho", name: "Thành Nhà Hồ",
    province: "Thanh Hóa", category: "heritage",
    lng: 105.5994, lat: 20.0682, rating: 4.4, reviewCount: 560,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Kinh thành đá duy nhất Đông Nam Á — UNESCO",
    priceRange: "$", openingHours: "07:00–17:30",
    tags: ["UNESCO", "đá-xanh"], source: "seed",
  },
  // ── Nghệ An ──
  {
    id: "50", slug: "cua-lo-beach", name: "Biển Cửa Lò",
    province: "Nghệ An", category: "beach",
    lng: 105.7191, lat: 18.8142, rating: 4.4, reviewCount: 1920,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Bãi tắm sạch đẹp mùa hè xứ Nghệ",
    tags: ["biển", "gia-đình", "mùa-hè"], source: "seed",
  },
  {
    id: "51", slug: "kim-lien-village", name: "Làng Kim Liên — quê Bác Hồ",
    province: "Nghệ An", category: "heritage",
    lng: 105.5553, lat: 18.6760, rating: 4.6, reviewCount: 2140,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Ngôi nhà thời thơ ấu của Chủ tịch Hồ Chí Minh",
    priceRange: "$", openingHours: "07:00–17:00",
    tags: ["lịch-sử", "tâm-linh"], source: "seed",
  },
  // ── Hà Tĩnh ──
  {
    id: "52", slug: "thien-cam-beach", name: "Biển Thiên Cầm",
    province: "Hà Tĩnh", category: "beach",
    lng: 105.9057, lat: 18.3607, rating: 4.4, reviewCount: 780,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Bãi biển hoang sơ — ít khách du lịch đại trà",
    tags: ["biển", "yên-tĩnh", "off-the-beaten"], source: "seed",
  },
  {
    id: "53", slug: "huong-tich-pagoda", name: "Chùa Hương Tích",
    province: "Hà Tĩnh", category: "heritage",
    lng: 105.8003, lat: 18.3290, rating: 4.5, reviewCount: 640,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Chùa cổ trên núi Hồng Lĩnh — non thiêng Hà Tĩnh",
    priceRange: "$", tags: ["tâm-linh", "leo-núi"], source: "seed",
  },
  // ── Quảng Trị ──
  {
    id: "54", slug: "vinh-moc-tunnels", name: "Địa đạo Vịnh Mốc",
    province: "Quảng Trị", category: "heritage",
    lng: 107.1872, lat: 17.0726, rating: 4.7, reviewCount: 1340,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Hệ thống địa đạo 3 tầng ngầm dưới đất thời chiến",
    priceRange: "$", openingHours: "07:00–17:00",
    tags: ["địa-đạo", "lịch-sử", "chiến-tranh"], source: "seed",
  },
  {
    id: "55", slug: "cua-tung-beach", name: "Biển Cửa Tùng",
    province: "Quảng Trị", category: "beach",
    lng: 107.1437, lat: 17.0451, rating: 4.4, reviewCount: 680,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Bãi biển nguyên sơ — từng được mệnh danh 'Nữ hoàng bãi biển'",
    tags: ["biển", "yên-tĩnh", "lịch-sử"], source: "seed",
  },
  {
    id: "15", slug: "hue-imperial", name: "Đại Nội Huế",
    province: "Huế", district: "Phú Xuân",
    category: "heritage", lng: 107.5909, lat: 16.4637, rating: 4.7, reviewCount: 2640,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    priceRange: "$$", openingHours: "06:30–17:30",
    tags: ["UNESCO", "triều-Nguyễn"], source: "seed",
  },
  {
    id: "16", slug: "bun-bo-hue", name: "Bún bò bà Phụng",
    province: "Huế", district: "Phú Xuân",
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
    province: "Đà Nẵng", district: "Duy Xuyên (Quảng Nam cũ)", category: "heritage",
    lng: 108.1241, lat: 15.7637, rating: 4.6, reviewCount: 1240,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    priceRange: "$$", tags: ["UNESCO", "Chăm-pa"], source: "seed",
  },
  {
    id: "21", slug: "hoi-an", name: "Phố cổ Hội An",
    province: "Đà Nẵng", district: "Hội An (Quảng Nam cũ)",
    category: "heritage", lng: 108.3380, lat: 15.8801, rating: 4.9, reviewCount: 2420,
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=80",
    highlight: "Đèn lồng rực rỡ về đêm",
    priceRange: "$$", openingHours: "Mở cả ngày",
    tags: ["UNESCO", "đèn-lồng", "may-đo"], source: "seed",
  },
  {
    id: "22", slug: "hoi-an-lantern-alley", name: "Hẻm đèn lồng Hội An",
    province: "Đà Nẵng", district: "Hội An (Quảng Nam cũ)",
    category: "checkin", lng: 108.3268, lat: 15.8770, rating: 4.7, reviewCount: 1980,
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=80",
    highlight: "Spot chụp đèn lồng nổi tiếng",
    tags: ["đèn-lồng", "đêm", "instagram"], source: "seed",
  },
  {
    id: "23", slug: "reaching-out-tea", name: "Reaching Out Tea House",
    province: "Đà Nẵng", district: "Hội An (Quảng Nam cũ)",
    address: "131 Trần Phú, Hội An",
    category: "cafe", lng: 108.3270, lat: 15.8772, rating: 4.9, reviewCount: 2140,
    cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=80",
    highlight: "Trà thất do người khiếm thính phục vụ — yên lặng tuyệt đối",
    priceRange: "$$", openingHours: "10:00–20:30",
    tags: ["trà", "yên-lặng", "social-impact"], source: "seed",
  },
  {
    id: "24", slug: "an-bang-beach", name: "Bãi An Bàng",
    province: "Đà Nẵng", district: "Hội An (Quảng Nam cũ)", category: "beach",
    lng: 108.3460, lat: 15.9180, rating: 4.6, reviewCount: 1380,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["beach-bar", "sunset"], source: "seed",
  },
  {
    id: "25", slug: "hoi-an-lantern-workshop", name: "Lớp làm đèn lồng Hội An",
    province: "Đà Nẵng", district: "Hội An (Quảng Nam cũ)",
    category: "experience", lng: 108.3290, lat: 15.8795, rating: 4.8, reviewCount: 920,
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=80",
    highlight: "Tự tay làm đèn lồng — mang về",
    priceRange: "$$", openingHours: "09:00–18:00",
    tags: ["workshop", "thủ-công", "family-friendly"], source: "seed",
  },
  {
    id: "26", slug: "quy-nhon", name: "Eo gió Quy Nhơn",
    province: "Gia Lai", district: "Quy Nhơn (Bình Định cũ)", category: "beach",
    lng: 109.2197, lat: 13.7820, rating: 4.6, reviewCount: 1190,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["off-the-beaten"], source: "seed",
  },
  // ── Quảng Ngãi ──
  {
    id: "56", slug: "ly-son-island", name: "Đảo Lý Sơn",
    province: "Quảng Ngãi", category: "beach",
    lng: 109.1263, lat: 15.3834, rating: 4.7, reviewCount: 1560,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Đảo tỏi — miệng núi lửa, biển xanh hoang sơ",
    priceRange: "$$", tags: ["đảo", "tỏi", "miệng-núi-lửa", "off-the-beaten"], source: "seed",
  },
  {
    id: "57", slug: "thien-an-hill", name: "Đồi Thiên Ấn",
    province: "Quảng Ngãi", category: "checkin",
    lng: 108.7928, lat: 15.1138, rating: 4.3, reviewCount: 480,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Đồi thông view sông Trà — địa linh nhân kiệt",
    tags: ["view", "tâm-linh", "thông"], source: "seed",
  },
  // ── Phú Yên ──
  {
    id: "58", slug: "ganh-da-dia", name: "Gành Đá Đĩa",
    province: "Đắk Lắk", district: "Tuy An (Phú Yên cũ)", category: "checkin",
    lng: 109.3110, lat: 13.5040, rating: 4.8, reviewCount: 2180,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Cột đá bazan hình lục giác — hiện tượng địa chất độc nhất VN",
    tags: ["địa-chất", "instagram", "sunrise"], source: "seed",
  },
  {
    id: "59", slug: "mui-dien-lighthouse", name: "Mũi Điện — Đại Lãnh",
    province: "Đắk Lắk", district: "Đông Hòa (Phú Yên cũ)", category: "checkin",
    lng: 109.4568, lat: 12.8986, rating: 4.7, reviewCount: 1240,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Cực Đông Tổ quốc — đón ánh bình minh đầu tiên",
    tags: ["cực-đông", "bình-minh", "hải-đăng"], source: "seed",
  },
  {
    id: "27", slug: "nha-trang", name: "Vịnh Nha Trang",
    province: "Khánh Hòa", category: "beach",
    lng: 109.1968, lat: 12.2388, rating: 4.5, reviewCount: 4290,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["lặn-biển", "tour-đảo"], source: "seed",
  },
  // ── Đắk Lắk ──
  {
    id: "60", slug: "ho-lak", name: "Hồ Lak",
    province: "Đắk Lắk", category: "nature",
    lng: 108.3392, lat: 12.3956, rating: 4.6, reviewCount: 980,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Hồ nước ngọt thiên nhiên lớn nhất Tây Nguyên — cưỡi voi",
    priceRange: "$$", tags: ["hồ", "voi", "Tây-Nguyên"], source: "seed",
  },
  {
    id: "61", slug: "dray-nur-waterfall", name: "Thác Dray Nur",
    province: "Đắk Lắk", category: "nature",
    lng: 107.9908, lat: 12.6086, rating: 4.6, reviewCount: 840,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Thác nước hùng vĩ — 'thác của vợ' trong truyền thuyết Ê-đê",
    tags: ["thác", "Tây-Nguyên", "thiên-nhiên"], source: "seed",
  },
  {
    id: "62", slug: "trung-nguyen-legend-cafe", name: "Trung Nguyên Legend Café",
    province: "Đắk Lắk", district: "Buôn Ma Thuột",
    address: "82 Phan Chu Trinh, Buôn Ma Thuột",
    category: "cafe", lng: 108.0503, lat: 12.6682, rating: 4.6, reviewCount: 1420,
    cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=80",
    highlight: "Nơi khai sinh cà phê Trung Nguyên — trải nghiệm cà phê Tây Nguyên",
    priceRange: "$$", openingHours: "06:30–22:00",
    tags: ["cà-phê", "Trung-Nguyên", "đặc-sản"], source: "seed",
  },
  // ── Gia Lai ──
  {
    id: "63", slug: "bien-ho-t-nuong", name: "Biển Hồ T'nưng",
    province: "Gia Lai", category: "nature",
    lng: 108.0011, lat: 13.9750, rating: 4.7, reviewCount: 1120,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Hồ miệng núi lửa — mắt ngọc Tây Nguyên",
    tags: ["hồ", "núi-lửa", "Tây-Nguyên", "sunrise"], source: "seed",
  },
  {
    id: "64", slug: "pleiku-coffee-street", name: "Phố cà phê Pleiku",
    province: "Gia Lai", category: "cafe",
    lng: 108.0060, lat: 13.9833, rating: 4.5, reviewCount: 640,
    cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=80",
    highlight: "Sáng sương mù, cà phê vợt — nét đặc trưng Pleiku",
    priceRange: "$", openingHours: "06:00–11:00",
    tags: ["cà-phê-vợt", "sương-mù", "địa-phương"], source: "seed",
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
    cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=80",
    highlight: "Cafe rừng thông — vibe Đà Lạt nguyên bản",
    priceRange: "$$", openingHours: "07:00–22:00",
    tags: ["view-rừng", "indie", "couple"], source: "seed",
  },
  {
    id: "30", slug: "mui-ne", name: "Mũi Né",
    province: "Lâm Đồng", district: "Phan Thiết (Bình Thuận cũ)", category: "beach",
    lng: 108.2902, lat: 10.9418, rating: 4.5, reviewCount: 2080,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["đồi-cát", "kite-surf"], source: "seed",
  },
  // ── Tây Ninh ──
  {
    id: "65", slug: "nui-ba-den", name: "Núi Bà Đen",
    province: "Tây Ninh", category: "mountain",
    lng: 106.0750, lat: 11.4053, rating: 4.7, reviewCount: 2840,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Ngọn núi cao nhất Nam Bộ — cáp treo dài nhất châu Á",
    priceRange: "$$", tags: ["cáp-treo", "tâm-linh", "sunrise", "leo-núi"], source: "seed",
  },
  {
    id: "66", slug: "cao-dai-holy-see", name: "Toà Thánh Cao Đài Tây Ninh",
    province: "Tây Ninh", category: "heritage",
    lng: 106.0868, lat: 11.3039, rating: 4.6, reviewCount: 1840,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Công trình kiến trúc tâm linh độc đáo nhất VN",
    priceRange: "$", openingHours: "06:00–17:00",
    tags: ["tôn-giáo", "kiến-trúc", "lễ-cúng"], source: "seed",
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
    cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=80",
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
  // ── An Giang ──
  {
    id: "67", slug: "nui-sam-chau-doc", name: "Núi Sam — Châu Đốc",
    province: "An Giang", category: "heritage",
    lng: 105.1258, lat: 10.7078, rating: 4.6, reviewCount: 2140,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Ngọn núi linh thiêng nhất miền Tây — lễ hội Bà Chúa Xứ",
    priceRange: "$", tags: ["tâm-linh", "leo-núi", "lễ-hội"], source: "seed",
  },
  {
    id: "68", slug: "mua-nuoc-noi-an-giang", name: "Mùa nước nổi An Giang",
    province: "An Giang", category: "experience",
    lng: 105.0664, lat: 10.8631, rating: 4.5, reviewCount: 780,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Đồng bằng mùa lũ — bắt cá linh, điên điển nở vàng tháng 9-11",
    priceRange: "$$", tags: ["mùa-nước-nổi", "đồng-bằng", "tháng-9-11"], source: "seed",
  },
  // ── Cà Mau ──
  {
    id: "69", slug: "mui-ca-mau", name: "Mũi Cà Mau",
    province: "Cà Mau", category: "checkin",
    lng: 104.7217, lat: 8.5673, rating: 4.8, reviewCount: 1560,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Điểm cực Nam Tổ quốc — nơi hai biển Đông-Tây gặp nhau",
    priceRange: "$$", tags: ["cực-Nam", "biển", "cột-mốc"], source: "seed",
  },
  {
    id: "70", slug: "u-minh-ha-forest", name: "Vườn QG U Minh Hạ",
    province: "Cà Mau", category: "nature",
    lng: 104.9060, lat: 9.0730, rating: 4.5, reviewCount: 680,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Rừng tràm ngập nước — thiên đường chim thú hoang dã",
    priceRange: "$$", tags: ["rừng-tràm", "chim", "sinh-thái", "off-the-beaten"], source: "seed",
  },
  {
    id: "39", slug: "phu-quoc", name: "Bãi Sao Phú Quốc",
    province: "An Giang", district: "Phú Quốc (Kiên Giang cũ)", category: "beach",
    lng: 103.9670, lat: 10.2270, rating: 4.7, reviewCount: 2180,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    tags: ["cát-trắng", "yên-tĩnh"], source: "seed",
  },
  {
    id: "40", slug: "con-dao", name: "Côn Đảo",
    province: "TP. HCM", district: "Côn Đảo (Bà Rịa - VT cũ)", category: "beach",
    lng: 106.6094, lat: 8.6916, rating: 4.8, reviewCount: 1620,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Đảo biệt lập — lịch sử & biển hoang sơ",
    priceRange: "$$$", tags: ["lịch-sử", "lặn-biển", "off-the-beaten"], source: "seed",
  },

  /* ─── HN checkin & experience ─── */
  {
    id: "71", slug: "ho-hoan-kiem", name: "Hồ Hoàn Kiếm",
    province: "Hà Nội", district: "Hoàn Kiếm",
    category: "checkin", lng: 105.8522, lat: 21.0285, rating: 4.8, reviewCount: 8920,
    cover: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=900&q=80",
    highlight: "Tháp Rùa & Đền Ngọc Sơn — trái tim Hà Nội",
    openingHours: "Mở cả ngày",
    tags: ["hồ", "đi-bộ", "lịch-sử", "sunrise"], source: "seed",
  },
  {
    id: "72", slug: "bat-trang-pottery", name: "Làng gốm Bát Tràng",
    province: "Hà Nội", district: "Gia Lâm",
    category: "experience", lng: 105.9165, lat: 20.9780, rating: 4.6, reviewCount: 1840,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Tự tay nặn gốm — làng nghề 500 năm tuổi",
    priceRange: "$$", openingHours: "08:00–17:00",
    tags: ["làng-nghề", "gốm", "workshop", "family-friendly"], source: "seed",
  },
  {
    id: "73", slug: "hanoi-food-tour", name: "Tour ẩm thực phố cổ HN",
    province: "Hà Nội", district: "Hoàn Kiếm",
    category: "experience", lng: 105.8530, lat: 21.0340, rating: 4.8, reviewCount: 920,
    cover: "https://images.unsplash.com/photo-1583224944844-5b268c057b72?w=900&q=80",
    highlight: "Xe ôm dẫn đường — bún chả, bánh cuốn, bún đậu, phở",
    priceRange: "$$", openingHours: "08:00–12:00 & 17:00–21:00",
    tags: ["food-tour", "đêm", "street-food", "xe-ôm"], source: "seed",
  },
  {
    id: "74", slug: "the-bookworm-hanoi", name: "The Bookworm",
    province: "Hà Nội", district: "Đống Đa",
    address: "44 Chùa Láng, Đống Đa, Hà Nội",
    category: "hidden", lng: 105.8452, lat: 21.0365, rating: 4.7, reviewCount: 580,
    cover: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=900&q=80",
    highlight: "Bar sách ẩn — jazz tối thứ 5, wine & expat community",
    priceRange: "$$", openingHours: "09:00–23:00",
    tags: ["bar-sách", "jazz", "hidden-gem", "expat"], source: "seed",
  },

  /* ─── HCM checkin, experience & nightlife ─── */
  {
    id: "75", slug: "buu-dien-sai-gon", name: "Bưu điện Trung tâm Sài Gòn",
    province: "TP. HCM", district: "Quận 1",
    address: "2 Công xã Paris, Quận 1",
    category: "checkin", lng: 106.6997, lat: 10.7798, rating: 4.7, reviewCount: 5640,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Công trình Pháp thuộc 1886 — kiến trúc Gothic đặc trưng",
    openingHours: "07:00–19:00",
    tags: ["pháp-thuộc", "kiến-trúc", "instagram"], source: "seed",
  },
  {
    id: "76", slug: "nguyen-hue-boulevard", name: "Phố đi bộ Nguyễn Huệ",
    province: "TP. HCM", district: "Quận 1",
    category: "checkin", lng: 106.7026, lat: 10.7730, rating: 4.6, reviewCount: 4380,
    cover: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&q=80",
    highlight: "Đại lộ đi bộ trung tâm — đêm lung linh ánh đèn",
    openingHours: "Mở cả ngày",
    tags: ["đi-bộ", "đêm", "trung-tâm", "sự-kiện"], source: "seed",
  },
  {
    id: "77", slug: "bui-vien-street", name: "Phố Tây Bùi Viện",
    province: "TP. HCM", district: "Quận 1",
    address: "Bùi Viện, Phạm Ngũ Lão, Quận 1",
    category: "nightlife", lng: 106.6947, lat: 10.7683, rating: 4.4, reviewCount: 2840,
    cover: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=900&q=80",
    highlight: "Phố Tây sôi động nhất Sài Gòn — nhạc live, bia tươi, backpacker",
    priceRange: "$$", openingHours: "18:00–02:00",
    tags: ["phố-tây", "backpacker", "nhạc-live", "đêm"], source: "seed",
  },
  {
    id: "78", slug: "saigon-cooking-class", name: "Lớp học nấu ăn Sài Gòn",
    province: "TP. HCM", district: "Quận 1",
    category: "experience", lng: 106.6889, lat: 10.7762, rating: 4.8, reviewCount: 740,
    cover: "https://images.unsplash.com/photo-1583224944844-5b268c057b72?w=900&q=80",
    highlight: "Đi chợ Bến Thành, học nấu 3 món — mang về công thức",
    priceRange: "$$$", openingHours: "08:00–13:00 & 15:00–20:00",
    tags: ["cooking-class", "workshop", "ẩm-thực", "market-tour"], source: "seed",
  },

  /* ─── ĐN / Hội An checkin & experience ─── */
  {
    id: "79", slug: "ba-na-golden-bridge", name: "Cầu Vàng Ba Nà Hills",
    province: "Đà Nẵng", district: "Hòa Vang",
    category: "checkin", lng: 107.9857, lat: 15.9978, rating: 4.7, reviewCount: 6840,
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80",
    highlight: "Cầu đi bộ nâng đỡ bởi 2 bàn tay khổng lồ — viral toàn cầu",
    priceRange: "$$$", openingHours: "07:30–21:00",
    tags: ["cáp-treo", "kiến-trúc", "instagram", "viral"], source: "seed",
  },
  {
    id: "80", slug: "tra-que-herb-village", name: "Làng rau Trà Quế",
    province: "Đà Nẵng", district: "Hội An (Quảng Nam cũ)",
    category: "experience", lng: 108.3385, lat: 15.9076, rating: 4.7, reviewCount: 1240,
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80",
    highlight: "Trải nghiệm làm nông + nấu ăn — làng rau 400 năm tuổi",
    priceRange: "$$", openingHours: "07:00–17:00",
    tags: ["làng-nghề", "nông-nghiệp", "cooking", "family-friendly"], source: "seed",
  },
  /* ═══════════════════════════════ Quần đảo ═══════════════════════════════ */
  {
    id: "81", slug: "dao-phu-lam-hoang-sa", name: "Đảo Phú Lâm — Hoàng Sa",
    province: "Hoàng Sa (Việt Nam)", district: "Hoàng Sa (Đà Nẵng)",
    category: "nature", lng: 112.3386, lat: 16.8422, rating: 4.9, reviewCount: 180,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Đảo lớn nhất Hoàng Sa — rạn san hô nguyên sinh",
    nameEn: "Phu Lam Island — Paracel Islands",
    highlightEn: "Largest island in Paracels — pristine coral reef",
    tags: ["đảo", "san-hô", "biển-xanh", "chủ-quyền"], source: "seed",
  },
  {
    id: "82", slug: "dao-hoang-sa-bien-dong", name: "Quần đảo Hoàng Sa",
    province: "Hoàng Sa (Việt Nam)", district: "Hoàng Sa (Đà Nẵng)",
    category: "heritage", lng: 112.0, lat: 16.5, rating: 5.0, reviewCount: 320,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Lãnh thổ thiêng liêng của Tổ quốc trên Biển Đông",
    nameEn: "Paracel Islands",
    highlightEn: "Sacred Vietnamese territory in the South China Sea",
    tags: ["quần-đảo", "chủ-quyền", "biển-đông", "lịch-sử"], source: "seed",
  },
  {
    id: "83", slug: "dao-truong-sa-lon", name: "Đảo Trường Sa Lớn",
    province: "Trường Sa (Việt Nam)", district: "Trường Sa (Khánh Hòa)",
    category: "heritage", lng: 111.9215, lat: 8.6581, rating: 5.0, reviewCount: 240,
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=80",
    highlight: "Trung tâm hành chính quần đảo Trường Sa — phên dậu Tổ quốc",
    nameEn: "Spratly Island (Đảo Trường Sa Lớn)",
    highlightEn: "Administrative center of the Spratly Islands — Vietnam's eastern frontier",
    tags: ["đảo", "chủ-quyền", "biển-đông", "hải-quân"], source: "seed",
  },
  {
    id: "84", slug: "dao-song-tu-tay", name: "Đảo Song Tử Tây",
    province: "Trường Sa (Việt Nam)", district: "Trường Sa (Khánh Hòa)",
    category: "nature", lng: 114.3293, lat: 11.4500, rating: 4.8, reviewCount: 150,
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80",
    highlight: "Đảo xa nhất phía Bắc Trường Sa — ngọn hải đăng trên Biển Đông",
    nameEn: "Southwest Cay (Song Tu Tay Island)",
    highlightEn: "Northernmost island in Spratlys — lighthouse on the South China Sea",
    tags: ["đảo", "hải-đăng", "san-hô", "chủ-quyền"], source: "seed",
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
export function haversineKm(a: [number, number], b: [number, number]): number {
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

export interface Bounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

/** Places within the supplied geographic bounds (used by viewport-aware search). */
export function placesInBounds(b: Bounds | null): PlaceItem[] {
  if (!b) return [];
  return allPlaces.filter(
    (p) => p.lng >= b.west && p.lng <= b.east && p.lat >= b.south && p.lat <= b.north
  );
}

/** N closest places to a coordinate, sorted by haversine distance. */
export function placesNearCoord(
  coord: [number, number],
  limit = 5
): Array<PlaceItem & { distanceKm: number }> {
  return allPlaces
    .map((p) => ({ ...p, distanceKm: haversineKm(coord, p.coordinates) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
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
