import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getPlaceBySlug, getNearbyPlaces, listAllPlaces } from "@/features/place/lib/queries";
import { PlaceFullPage } from "@/features/place/components/PlaceFullPage";
import { categoryByKey } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { localizedAlternates } from "@/i18n/metadata";

interface Params {
  slug: string;
}

export async function generateStaticParams() {
  const places = await listAllPlaces();
  return places.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [place, t, locale] = await Promise.all([
    getPlaceBySlug(slug),
    getTranslations("PlaceDetail"),
    getLocale(),
  ]);
  if (!place) return { title: t("notFound") };
  const cat = categoryByKey[place.category];
  const catLabel = locale === "en" ? cat.label : cat.labelVi;
  const description =
    place.highlight ??
    `${place.name} — ${catLabel} · ${place.province}. ${cat.description}.`;
  const ogUrl = `${siteConfig.url}/api/og?title=${encodeURIComponent(place.name)}&subtitle=${encodeURIComponent(place.province)}&cover=${encodeURIComponent(place.cover)}&tag=${encodeURIComponent(`${catLabel} · ${place.province}`)}&locale=${locale}`;
  return {
    title: `${place.name} · ${place.province}`,
    description,
    openGraph: {
      title: place.name,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: place.name, description },
    alternates: localizedAlternates(`/place/${slug}`, locale),
  };
}

export default async function PlaceRoute({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) notFound();
  const nearby = await getNearbyPlaces(slug, { limit: 6 });
  return <PlaceFullPage place={place} nearby={nearby} />;
}
