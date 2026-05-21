import { notFound } from "next/navigation";
import { getPlaceBySlug, getNearbyPlaces, listAllPlaces } from "@/features/place/lib/queries";
import { PlaceFullPage } from "@/features/place/components/PlaceFullPage";
import { categoryByKey } from "@/config/categories";
import { siteConfig } from "@/config/site";

interface Params {
  slug: string;
}

export async function generateStaticParams() {
  // Pre-build all known place slugs. Falls back to mock list when Supabase
  // isn't configured.
  const places = await listAllPlaces();
  return places.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) return { title: "Không tìm thấy" };
  const cat = categoryByKey[place.category];
  const description =
    place.highlight ??
    `${place.name} — ${cat.labelVi} tại ${place.province}. ${cat.description}.`;
  const ogUrl = `${siteConfig.url}/api/og?title=${encodeURIComponent(place.name)}&subtitle=${encodeURIComponent(place.province)}&cover=${encodeURIComponent(place.cover)}&tag=${encodeURIComponent(`${cat.label} · ${place.province}`)}`;
  return {
    title: `${place.name} · ${place.province}`,
    description,
    openGraph: {
      title: place.name,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: place.name, description },
  };
}

export default async function PlaceRoute({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) notFound();
  const nearby = await getNearbyPlaces(slug, { limit: 6 });
  return <PlaceFullPage place={place} nearby={nearby} />;
}
