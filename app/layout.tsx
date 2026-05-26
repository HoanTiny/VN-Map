import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import { ThemeNoFlashScript } from "@/components/theme/ThemeToggle";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { siteConfig } from "@/config/site";
import { localizedAlternates } from "@/i18n/metadata";
import { FloatingWavingFlags } from "@/components/motion";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  alternates: localizedAlternates("/"),
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    images: [{ url: `/api/og?title=${encodeURIComponent(siteConfig.name)}&subtitle=${encodeURIComponent(siteConfig.tagline)}`, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Map-VN",
  },
  icons: {
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f11" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}>
      <head>
        <ThemeNoFlashScript />
      </head>
      <body className="min-h-dvh bg-bg text-text antialiased">
        <AppProviders>{children}</AppProviders>
        <FloatingWavingFlags />
        <PWAProvider />
      </body>
    </html>
  );
}
