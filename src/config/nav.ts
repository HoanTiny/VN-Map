import { Map, Search, Heart, Briefcase, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export const topNav: NavItem[] = [
  { label: "Khám phá", href: "/explore" },
  { label: "Vùng miền", href: "/region" },
  { label: "Bộ sưu tập", href: "/collection" },
  { label: "Chuyến đi", href: "/trip" },
];

export const bottomTabs: Required<NavItem>[] = [
  { label: "Bản đồ", href: "/explore", icon: Map },
  { label: "Tìm",    href: "/search",  icon: Search },
  { label: "Đã lưu", href: "/saved",   icon: Heart },
  { label: "Chuyến đi", href: "/trip", icon: Briefcase },
  { label: "Tôi",    href: "/me",      icon: User },
];
