import { FloatingNavbar } from "@/components/nav/FloatingNavbar";
import { SearchBar } from "@/features/search/components/SearchBar";
import { PlaceCard, type PlaceCardData } from "@/features/place/components/PlaceCard";
import { CityCard, type CityCardData } from "@/features/region/components/CityCard";

export const metadata = { title: "Design showcase" };

const places: PlaceCardData[] = [
  {
    slug: "hoi-an",
    name: "Phố cổ Hội An",
    province: "Quảng Nam",
    category: "heritage",
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=80",
    rating: 4.9,
    reviewCount: 2420,
    price: "Miễn phí",
    highlight: "Đèn lồng rực rỡ về đêm",
  },
  {
    slug: "ha-long-bay",
    name: "Vịnh Hạ Long",
    province: "Quảng Ninh",
    category: "nature",
    cover: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=1200&q=80",
    rating: 4.8,
    reviewCount: 5180,
    price: "300.000đ",
  },
  {
    slug: "da-lat",
    name: "Đà Lạt",
    province: "Lâm Đồng",
    category: "city",
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80",
    rating: 4.7,
    reviewCount: 3120,
    highlight: "Sương mù & rừng thông",
  },
  {
    slug: "pho-bo",
    name: "Phở Bát Đàn",
    province: "Hà Nội",
    category: "food",
    cover: "https://images.unsplash.com/photo-1583224944844-5b268c057b72?w=1200&q=80",
    rating: 4.6,
    reviewCount: 980,
    price: "65.000đ",
  },
];

const cities: CityCardData[] = [
  {
    slug: "hanoi",
    name: "Hà Nội",
    region: "Miền Bắc",
    cover: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1400&q=80",
    placeCount: 248,
    tagline: "Thủ đô nghìn năm văn hiến — phố cổ, hồ Gươm, ẩm thực vỉa hè.",
  },
  {
    slug: "da-nang",
    name: "Đà Nẵng",
    region: "Miền Trung",
    cover: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1400&q=80",
    placeCount: 184,
    tagline: "Biển Mỹ Khê, cầu Vàng, đêm sông Hàn.",
  },
  {
    slug: "ho-chi-minh",
    name: "TP. Hồ Chí Minh",
    region: "Miền Nam",
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&q=80",
    placeCount: 312,
    tagline: "Năng lượng đô thị, ẩm thực 24/7, di sản Pháp.",
  },
];

export default function DesignShowcase() {
  return (
    <>
      <FloatingNavbar />
      <div className="container max-w-6xl pt-32 pb-24">
        <header className="mb-10 text-center">
          <p className="text-overline text-text-subtle">DESIGN SHOWCASE</p>
          <h1 className="mt-2 font-display text-display-lg text-text">Components Library</h1>
          <p className="mx-auto mt-4 max-w-2xl text-body-lg text-text-muted">
            Floating navbar · Search · Place card · City card.
          </p>
        </header>

        <Section title="Search — Airbnb + Google Maps">
          <SearchBar />
        </Section>

        <Section title="Place Card — Premium">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {places.map((p, i) => (
              <PlaceCard key={p.slug} place={p} priority={i < 2} className="h-full" />
            ))}
          </div>
        </Section>

        <Section title="City Card — Cinematic">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {cities.map((c, i) => (
              <CityCard key={c.slug} city={c} priority={i === 0} />
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16">
      <h2 className="mb-5 font-display text-h2 text-text">{title}</h2>
      {children}
    </section>
  );
}
