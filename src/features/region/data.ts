import type { CityCardData } from "./components/CityCard";

export const featuredCities: CityCardData[] = [
  {
    slug: "ha-noi",
    href: "/region/bac/ha-noi",
    name: "Hà Nội",
    region: "Miền Bắc",
    cover: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1400&q=80",
    placeCount: 248,
    tagline: "Thủ đô nghìn năm văn hiến — phố cổ, hồ Gươm, ẩm thực vỉa hè.",
  },
  {
    slug: "da-nang",
    href: "/region/trung/da-nang",
    name: "Đà Nẵng",
    region: "Miền Trung",
    cover: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1400&q=80",
    placeCount: 184,
    tagline: "Biển Mỹ Khê, cầu Vàng, đêm sông Hàn.",
  },
  {
    slug: "tp-hcm",
    href: "/region/nam/tp-hcm",
    name: "TP. Hồ Chí Minh",
    region: "Miền Nam",
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&q=80",
    placeCount: 312,
    tagline: "Năng lượng đô thị, ẩm thực 24/7, di sản Pháp.",
  },
];

export const collections = [
  {
    slug: "7d-mien-trung",
    title: "Cung đường miền Trung 7 ngày",
    description: "Huế → Đà Nẵng → Hội An → Quy Nhơn",
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=80",
    days: 7,
    placeCount: 18,
  },
  {
    slug: "biecn-mien-nam",
    title: "Biển đảo miền Nam",
    description: "Phú Quốc · Côn Đảo · Nam Du",
    cover: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
    days: 10,
    placeCount: 24,
  },
  {
    slug: "tay-bac-mua-lua",
    title: "Tây Bắc mùa lúa chín",
    description: "Mù Cang Chải · Sa Pa · Hà Giang",
    cover: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80",
    days: 6,
    placeCount: 15,
  },
];
