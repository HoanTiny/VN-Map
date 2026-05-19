import { notFound } from "next/navigation";
import { getPlaceBySlug, allPlaces } from "@/features/map/lib/places-data";
import { PlaceFullPage } from "@/features/place/components/PlaceFullPage";
import { categoryByKey } from "@/config/categories";

interface Params {
  slug: string;
}

export function generateStaticParams() {
  return allPlaces.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);
  if (!place) return { title: "Không tìm thấy" };
  const cat = categoryByKey[place.category];
  return {
    title: `${place.name} · ${place.province}`,
    description:
      place.highlight ??
      `${place.name} — ${cat.labelVi} tại ${place.province}. ${cat.description}.`,
    openGraph: {
      title: place.name,
      description: place.highlight ?? cat.description,
      images: [place.cover],
    },
  };
}

export default async function PlaceRoute({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);
  if (!place) notFound();
  return <PlaceFullPage place={place} />;
}
