import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware drop-in replacements for next/link, next/navigation
// Usage: import { Link, useRouter, usePathname, redirect } from "@/i18n/navigation"
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
