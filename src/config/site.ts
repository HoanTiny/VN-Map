export const siteConfig = {
  name: "VN Go",
  tagline: "Ăn chơi Việt Nam theo cách của bạn",
  description:
    "Bản đồ cộng đồng cho quán ăn, cafe, bar, rooftop, hidden gem và trải nghiệm local — Google Maps cho ăn chơi tại Việt Nam.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "vi-VN",
  ogImage: "/og/default.png",
} as const;
