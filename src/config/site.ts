export const siteConfig = {
  name: "Map-VN",
  tagline: "Khám phá Việt Nam trên bản đồ",
  description:
    "Nền tảng bản đồ trải nghiệm Việt Nam — biển, núi, di sản, ẩm thực, đô thị, thiên nhiên.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "vi-VN",
  ogImage: "/og/default.png",
} as const;
