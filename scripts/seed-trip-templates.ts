/**
 * Seed Supabase `trip_templates` with 4 curated itineraries.
 * Run after migration 0005_trip_templates.sql is applied.
 *
 * Usage:
 *   pnpm seed:trips
 */
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
});

const TEMPLATES = [
  {
    slug: "ha-noi-tet-3-ngay",
    title: "Tết Hà Nội cổ kính 3 ngày",
    summary:
      "Hành trình du xuân quanh phố cổ, Hồ Gươm và chợ hoa Quảng Bá — ăn phở sáng, cafe trứng chiều, cocktail tối.",
    cover: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=2000&q=85",
    duration_days: 3,
    season: "tet" as const,
    destinations: ["ha-noi"],
    tags: ["phố cổ", "ẩm thực", "cafe", "lễ Tết"],
    days: [
      {
        label: "Ngày 1 — Phố cổ & Hồ Gươm",
        placeSlugs: ["hanoi-old-quarter", "pho-bat-dan", "cafe-giang", "ne-cocktail-bar"],
        note: "Bắt đầu sáng sớm với bát phở Bát Đàn, lang thang phố cổ rồi nghỉ cafe trứng Giảng. Tối thưởng thức cocktail tại Nê.",
      },
      {
        label: "Ngày 2 — Long Biên & Tạ Hiện",
        placeSlugs: ["long-bien-bridge", "twilight-sky-bar"],
        note: "Đạp xe cầu Long Biên đón nắng sáng, chiều ngắm hoàng hôn từ rooftop Twilight.",
      },
      {
        label: "Ngày 3 — Ninh Bình day-trip",
        placeSlugs: ["ninh-binh"],
        note: "Tour Tam Cốc — Bích Động cả ngày, tối về Hà Nội.",
      },
    ],
    display_order: 10,
  },
  {
    slug: "da-nang-hoi-an-he-4-ngay",
    title: "Đà Nẵng — Hội An mùa hè 4 ngày",
    summary:
      "Tắm biển Mỹ Khê, dạo phố cổ Hội An, thắp đèn lồng đêm và check-in Bà Nà — combo biển + di sản kinh điển miền Trung.",
    cover: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2000&q=85",
    duration_days: 4,
    season: "summer" as const,
    destinations: ["da-nang"],
    tags: ["biển", "phố cổ", "di sản", "hè"],
    days: [
      {
        label: "Ngày 1 — Đà Nẵng đón biển",
        placeSlugs: ["danang-my-khe", "sky36-da-nang"],
        note: "Sáng tắm biển Mỹ Khê, chiều cafe view biển, tối lên Sky36 ngắm pháo hoa cầu Rồng.",
      },
      {
        label: "Ngày 2 — Bà Nà & Mỹ Sơn",
        placeSlugs: ["danang-city", "my-son"],
        note: "Sáng đi Bà Nà Hills, chiều ghé Thánh địa Mỹ Sơn.",
      },
      {
        label: "Ngày 3 — Hội An phố cổ",
        placeSlugs: ["hoi-an", "hoi-an-lantern-alley", "reaching-out-tea", "an-bang-beach"],
        note: "Trọn ngày khám phá Hội An — phố cổ sáng, trà Reaching Out chiều, đèn lồng tối, ngủ đêm ở An Bàng.",
      },
      {
        label: "Ngày 4 — Workshop làm đèn",
        placeSlugs: ["hoi-an-lantern-workshop", "an-bang-beach"],
        note: "Sáng thử làm đèn lồng tự tay, chiều tắm biển An Bàng rồi bay về.",
      },
    ],
    display_order: 20,
  },
  {
    slug: "sapa-mua-lua-chin-3-ngay",
    title: "Sa Pa mùa lúa chín 3 ngày",
    summary:
      "Săn mây Fansipan, lội ruộng bậc thang vàng rực và ngủ homestay bản Mai Châu — chuyến trekking mùa thu Tây Bắc đáng nhớ.",
    cover: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2000&q=85",
    duration_days: 3,
    season: "autumn" as const,
    destinations: ["lao-cai", "phu-tho"],
    tags: ["núi", "ruộng bậc thang", "trekking", "mùa lúa"],
    days: [
      {
        label: "Ngày 1 — Sa Pa & Fansipan",
        placeSlugs: ["sa-pa"],
        note: "Cáp treo lên đỉnh Fansipan đón bình minh trên mây.",
      },
      {
        label: "Ngày 2 — Mù Cang Chải ruộng vàng",
        placeSlugs: ["mu-cang-chai"],
        note: "Trekking ruộng bậc thang Mù Cang Chải, ngắm chiều tà La Pán Tẩn.",
      },
      {
        label: "Ngày 3 — Mai Châu homestay",
        placeSlugs: ["mai-chau-valley", "ban-lac-homestay"],
        note: "Đạp xe quanh thung lũng Mai Châu, ngủ đêm bản Lác.",
      },
    ],
    display_order: 30,
  },
  {
    slug: "sai-gon-cuoi-tuan-2-ngay",
    title: "Sài Gòn cuối tuần 2 ngày",
    summary:
      "Cafe sáng tại Chung cư Nguyễn Huệ, dạo Bưu điện trung tâm, cocktail Bitexco — gói gọn Sài Gòn năng động trong 48 giờ.",
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2000&q=85",
    duration_days: 2,
    season: "any" as const,
    destinations: ["ho-chi-minh"],
    tags: ["thành phố", "cafe", "cocktail", "weekend"],
    days: [
      {
        label: "Ngày 1 — Khám phá trung tâm",
        placeSlugs: ["hanoi-old-quarter"],
        note: "(Mẫu — thay bằng các place HCM thực tế khi có)",
      },
      {
        label: "Ngày 2 — Rooftop & ẩm thực",
        placeSlugs: ["twilight-sky-bar"],
        note: "(Mẫu — thay bằng các place HCM thực tế khi có)",
      },
    ],
    display_order: 40,
  },
];

async function run() {
  console.log(`Seeding ${TEMPLATES.length} trip templates…`);
  const payload = TEMPLATES.map((t) => ({ ...t, enabled: true }));
  const { data, error } = await supabase
    .from("trip_templates")
    .upsert(payload as never, { onConflict: "slug" })
    .select("slug");
  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
  console.log(
    `✓ Upserted ${data?.length ?? 0} templates:`,
    data?.map((d: { slug: string }) => d.slug).join(", ")
  );
  process.exit(0);
}

run();
