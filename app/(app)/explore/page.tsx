import { MapExperienceLazy } from "@/features/map/components/MapCanvasLazy";

export const metadata = { title: "Khám phá" };

export default function ExplorePage() {
  return (
    <div className="relative h-[calc(100dvh-4rem-4rem)] md:h-[calc(100dvh-4rem)]">
      <MapExperienceLazy />
    </div>
  );
}
