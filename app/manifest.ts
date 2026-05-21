import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Map-VN — Bản đồ trải nghiệm Việt Nam",
    short_name: "Map-VN",
    description: "Khám phá địa điểm ẩm thực, cafe, checkin và trải nghiệm trên khắp Việt Nam",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#C62828",
    orientation: "portrait-primary",
    categories: ["travel", "food", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile.png",
        sizes: "390x844",
        type: "image/png",
        // @ts-ignore
        form_factor: "narrow",
        label: "Khám phá bản đồ địa điểm Việt Nam",
      },
      {
        src: "/screenshots/desktop.png",
        sizes: "1280x800",
        type: "image/png",
        // @ts-ignore
        form_factor: "wide",
        label: "Map-VN trên desktop",
      },
    ],
    shortcuts: [
      {
        name: "Khám phá bản đồ",
        short_name: "Bản đồ",
        url: "/explore",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Địa điểm đã lưu",
        short_name: "Đã lưu",
        url: "/saved",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
