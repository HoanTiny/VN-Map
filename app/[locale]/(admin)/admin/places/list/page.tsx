import { createServiceClient } from "@/lib/supabase/server";
import { PlacesEditor, type EditablePlace } from "@/features/admin/components/PlacesEditor";

export const metadata = { title: "Sửa địa điểm · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPlacesListPage() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("places")
    .select(
      "id,slug,name,cover,province,province_slug,category,highlight,address,price_range,opening_hours,tags,source,rating,review_count,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div>
        <h1 className="font-display text-display-sm">Sửa địa điểm</h1>
        <p className="mt-4 text-body text-danger">Lỗi tải dữ liệu: {error.message}</p>
      </div>
    );
  }

  const places = (data ?? []) as EditablePlace[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-display-sm text-text">Sửa địa điểm</h1>
        <p className="mt-1 text-body text-text-muted">
          {places.length} địa điểm · click vào ô để chỉnh cover, highlight, địa chỉ…
        </p>
      </div>
      <PlacesEditor initialPlaces={places} />
    </div>
  );
}
