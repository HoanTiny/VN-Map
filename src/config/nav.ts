import { Map, Search, Heart, Briefcase, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  /** i18n key under the `Nav` namespace, e.g. "explore" -> messages.Nav.explore */
  key: string;
  href: string;
  icon?: LucideIcon;
}

export const topNav: NavItem[] = [
  { key: "explore", href: "/explore" },
  { key: "regions", href: "/region" },
  { key: "collections", href: "/#bo-suu-tap" },
  { key: "trips", href: "/trip" },
];

export const bottomTabs: Required<NavItem>[] = [
  { key: "map",    href: "/explore", icon: Map },
  { key: "find",   href: "/search",  icon: Search },
  { key: "saved",  href: "/saved",   icon: Heart },
  { key: "trips",  href: "/trip",    icon: Briefcase },
  { key: "me",     href: "/me",      icon: User },
];
