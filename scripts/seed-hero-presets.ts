/**
 * Seed Supabase `hero_presets` with the 10 hardcoded regions from
 * DynamicHeroBackground.tsx so the admin CMS has initial content to edit.
 *
 * Usage:
 *   pnpm tsx scripts/seed-hero-presets.ts
 *
 * Safe to run multiple times — uses upsert on `region`.
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

interface ImageItem { src: string; alt: string }
interface TimePreset { images: ImageItem[]; overlay: string }
interface RegionPresets { day: TimePreset; sunset: TimePreset; night: TimePreset }

const OVERLAY_DAY = "from-black/35 via-black/10 to-transparent";
const OVERLAY_SUNSET = "from-black/40 via-black/12 to-transparent";
const OVERLAY_NIGHT = "from-black/50 via-black/15 to-transparent";

const REGIONS: Array<{
  region: string;
  label: string;
  match_keywords: string[];
  is_default?: boolean;
  display_order: number;
  presets: RegionPresets;
}> = [
  {
    region: "default",
    label: "Mặc định (Việt Nam)",
    match_keywords: [],
    is_default: true,
    display_order: 0,
    presets: {
      day: {
        images: [
          { src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85", alt: "Vịnh Hạ Long nắng trong xanh" },
          { src: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=2400&q=85", alt: "Danh thắng Tràng An Ninh Bình hùng vĩ" },
          { src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=85", alt: "Ruộng bậc thang xanh ngút ngàn Tây Bắc" },
        ],
        overlay: OVERLAY_DAY,
      },
      sunset: {
        images: [
          { src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=85", alt: "Phố cổ Hội An hoàng hôn rực rỡ" },
          { src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85", alt: "Sông Hoài Hội An buổi chiều tà rực nắng" },
        ],
        overlay: OVERLAY_SUNSET,
      },
      night: {
        images: [
          { src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85", alt: "Sài Gòn sông đêm lấp lánh chói sáng" },
          { src: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=2400&q=85", alt: "Phố cổ Hội An lung linh đèn lồng đêm" },
        ],
        overlay: OVERLAY_NIGHT,
      },
    },
  },
  {
    region: "hanoi",
    label: "Hà Nội",
    match_keywords: ["hanoi", "ha noi"],
    display_order: 10,
    presets: {
      day: { images: [
        { src: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=2400&q=85", alt: "Hồ Gươm nắng sớm yên bình tháp Rùa" },
        { src: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=2400&q=85", alt: "Phố cổ Hà Nội nhộn nhịp ban ngày" },
      ], overlay: OVERLAY_DAY },
      sunset: { images: [
        { src: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=2400&q=85", alt: "Hoàng hôn Hồ Tây nhuộm đỏ rực rỡ" },
        { src: "https://images.unsplash.com/photo-1543968996-ee822b8176bc?auto=format&fit=crop&w=2400&q=85", alt: "Cầu Long Biên nhuộm màu nắng chiều tà" },
      ], overlay: OVERLAY_SUNSET },
      night: { images: [
        { src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=85", alt: "Phố Tạ Hiện lung linh nhộn nhịp về đêm" },
        { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85", alt: "Nhà Thờ Lớn Hà Nội lung linh ánh đèn đêm" },
      ], overlay: OVERLAY_NIGHT },
    },
  },
  {
    region: "danang",
    label: "Đà Nẵng",
    match_keywords: ["da nang", "danang"],
    display_order: 20,
    presets: {
      day: { images: [
        { src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2400&q=85", alt: "Cầu Vàng Bà Nà Hills trong nắng mây ngập tràn" },
        { src: "https://images.unsplash.com/photo-1559519529-0504685a7327?auto=format&fit=crop&w=2400&q=85", alt: "Bờ biển Đà Nẵng nắng xanh biếc" },
      ], overlay: OVERLAY_DAY },
      sunset: { images: [
        { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85", alt: "Hoàng hôn biển Mỹ Khê vàng rực nắng chiều" },
        { src: "https://images.unsplash.com/photo-1545231027-63b3f162e0cd?auto=format&fit=crop&w=2400&q=85", alt: "Bán đảo Sơn Trà hoàng hôn bóng chiều" },
      ], overlay: OVERLAY_SUNSET },
      night: { images: [
        { src: "https://images.unsplash.com/photo-1534008757030-27299c4371b6?auto=format&fit=crop&w=2400&q=85", alt: "Cầu Rồng phun lửa rực rỡ lấp lánh ban đêm" },
      ], overlay: "from-black/45 via-black/15 to-transparent" },
    },
  },
  {
    region: "saigon",
    label: "TP. Hồ Chí Minh",
    match_keywords: ["ho chi minh", "saigon", "hcm"],
    display_order: 30,
    presets: {
      day: { images: [
        { src: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2400&q=85", alt: "Bưu điện Trung tâm Sài Gòn ngày nắng đẹp" },
        { src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=85", alt: "Chung cư Cafe Nguyễn Huệ độc đáo giữa lòng phố" },
      ], overlay: OVERLAY_DAY },
      sunset: { images: [
        { src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=85", alt: "Hoàng hôn buông xuống sông Sài Gòn rực rỡ" },
      ], overlay: OVERLAY_SUNSET },
      night: { images: [
        { src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85", alt: "Đêm đô thị Sài Gòn lung linh Landmark 81 sông nước" },
      ], overlay: OVERLAY_NIGHT },
    },
  },
  {
    region: "hue",
    label: "Huế",
    match_keywords: ["hue", "thua thien"],
    display_order: 40,
    presets: {
      day: { images: [
        { src: "https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?auto=format&fit=crop&w=2400&q=85", alt: "Đại Nội Huế cổ kính trầm mặc ngày nắng" },
        { src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85", alt: "Sông Hương thuyền rồng êm đềm trôi" },
      ], overlay: OVERLAY_DAY },
      sunset: { images: [
        { src: "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=2400&q=85", alt: "Cầu Trường Tiền in bóng sông Hương chiều tà" },
      ], overlay: OVERLAY_SUNSET },
      night: { images: [
        { src: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=2400&q=85", alt: "Kinh thành Huế lung linh ánh đèn đêm" },
      ], overlay: OVERLAY_NIGHT },
    },
  },
  {
    region: "hoian",
    label: "Hội An",
    match_keywords: ["hoi an", "hoian", "quang nam"],
    display_order: 50,
    presets: {
      day: { images: [
        { src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2400&q=85", alt: "Phố cổ Hội An nhà cổ vàng dưới nắng" },
        { src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2400&q=85", alt: "Chùa Cầu Hội An biểu tượng phố cổ" },
      ], overlay: OVERLAY_DAY },
      sunset: { images: [
        { src: "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&w=2400&q=85", alt: "Sông Hoài Hội An hoàng hôn nhuộm vàng" },
      ], overlay: OVERLAY_SUNSET },
      night: { images: [
        { src: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=2400&q=85", alt: "Đèn lồng Hội An lung linh đêm thả hoa đăng" },
      ], overlay: OVERLAY_NIGHT },
    },
  },
  {
    region: "nhatrang",
    label: "Nha Trang",
    match_keywords: ["nha trang", "khanh hoa"],
    display_order: 60,
    presets: {
      day: { images: [
        { src: "https://images.unsplash.com/photo-1559519529-0504685a7327?auto=format&fit=crop&w=2400&q=85", alt: "Biển Nha Trang xanh ngọc cát trắng ngày hè" },
        { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85", alt: "Vịnh Nha Trang nắng vàng thuyền câu" },
      ], overlay: OVERLAY_DAY },
      sunset: { images: [
        { src: "https://images.unsplash.com/photo-1545231027-63b3f162e0cd?auto=format&fit=crop&w=2400&q=85", alt: "Hoàng hôn biển Nha Trang tím rực rỡ" },
      ], overlay: OVERLAY_SUNSET },
      night: { images: [
        { src: "https://images.unsplash.com/photo-1534008757030-27299c4371b6?auto=format&fit=crop&w=2400&q=85", alt: "Vinpearl Nha Trang lung linh sáng đêm" },
      ], overlay: OVERLAY_NIGHT },
    },
  },
  {
    region: "sapa",
    label: "Sa Pa",
    match_keywords: ["sa pa", "sapa", "lao cai"],
    display_order: 70,
    presets: {
      day: { images: [
        { src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=85", alt: "Ruộng bậc thang Sapa xanh ngút ngàn mùa nước đổ" },
        { src: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=2400&q=85", alt: "Sapa biển mây trắng bồng bềnh sườn núi" },
      ], overlay: OVERLAY_DAY },
      sunset: { images: [
        { src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2400&q=85", alt: "Đỉnh Fansipan hoàng hôn rực hồng cam" },
      ], overlay: OVERLAY_SUNSET },
      night: { images: [
        { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85", alt: "Sapa đêm sương lạnh đèn vàng ấm áp" },
      ], overlay: OVERLAY_NIGHT },
    },
  },
  {
    region: "phuquoc",
    label: "Phú Quốc",
    match_keywords: ["phu quoc", "kien giang"],
    display_order: 80,
    presets: {
      day: { images: [
        { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85", alt: "Bãi Sao Phú Quốc cát trắng nước xanh ngọc" },
        { src: "https://images.unsplash.com/photo-1559519529-0504685a7327?auto=format&fit=crop&w=2400&q=85", alt: "Vùng biển Phú Quốc thiên đường nhiệt đới" },
      ], overlay: OVERLAY_DAY },
      sunset: { images: [
        { src: "https://images.unsplash.com/photo-1545231027-63b3f162e0cd?auto=format&fit=crop&w=2400&q=85", alt: "Cầu Hôn Phú Quốc hoàng hôn vàng son" },
      ], overlay: OVERLAY_SUNSET },
      night: { images: [
        { src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85", alt: "Phú Quốc đêm cảng cá nhộn nhịp ánh đèn" },
      ], overlay: OVERLAY_NIGHT },
    },
  },
  {
    region: "halong",
    label: "Hạ Long",
    match_keywords: ["ha long", "halong", "quang ninh", "hai phong"],
    display_order: 90,
    presets: {
      day: { images: [
        { src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85", alt: "Vịnh Hạ Long nắng trong núi đá kì vĩ" },
        { src: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=2400&q=85", alt: "Du thuyền Hạ Long lướt giữa hàng nghìn đảo" },
      ], overlay: OVERLAY_DAY },
      sunset: { images: [
        { src: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=2400&q=85", alt: "Hoàng hôn Vịnh Hạ Long vàng rực biển ngọc" },
      ], overlay: OVERLAY_SUNSET },
      night: { images: [
        { src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85", alt: "Hạ Long đêm du thuyền và đảo lung linh" },
      ], overlay: OVERLAY_NIGHT },
    },
  },
];

async function run() {
  console.log(`Seeding ${REGIONS.length} hero_presets…`);
  // Normalize: ensure non-nullable fields always have an explicit value
  // (otherwise upsert sends `null` for `undefined`).
  const payload = REGIONS.map((r) => ({
    ...r,
    is_default: r.is_default ?? false,
    enabled: true,
  }));

  const { data, error } = await supabase
    .from("hero_presets")
    .upsert(payload as never, { onConflict: "region" })
    .select("region");

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
  console.log(`✓ Upserted ${data?.length ?? 0} regions:`, data?.map((d: { region: string }) => d.region).join(", "));
  process.exit(0);
}

run();
