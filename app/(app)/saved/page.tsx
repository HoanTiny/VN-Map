import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { SavedPlaces } from "@/features/saved/components/SavedPlaces";

export const metadata = {
  title: "Đã lưu · Map-VN",
};

export default function SavedPage() {
  return (
    <AuthGuard mode="redirect">
      <SavedPlaces />
    </AuthGuard>
  );
}
