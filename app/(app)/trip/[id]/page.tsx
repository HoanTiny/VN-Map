import { TripPlanner } from "@/features/trip/components/TripPlanner";

interface Params {
  id: string;
}

export const metadata = {
  title: "Chuyến đi · Map-VN",
};

export default async function TripDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return <TripPlanner tripId={id} />;
}
