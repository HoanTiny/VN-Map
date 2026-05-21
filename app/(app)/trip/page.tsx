import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { TripList } from "@/features/trip/components/TripList";

export const metadata = {
  title: "Chuyến đi · Map-VN",
};

export default function TripIndexPage() {
  return (
    <AuthGuard mode="redirect">
      <TripList />
    </AuthGuard>
  );
}
