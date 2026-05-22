import { listAllTripTemplatesAdmin } from "@/features/trip-template/lib/queries";
import { TripTemplatesEditor } from "@/features/admin/components/TripTemplatesEditor";

export const metadata = { title: "Lịch trình tinh tuyển · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminTripTemplatesPage() {
  const templates = await listAllTripTemplatesAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-display-sm text-text">Lịch trình tinh tuyển</h1>
        <p className="mt-1 text-body text-text-muted">
          {templates.length} template · quản lý các lộ trình mẫu hiển thị trên landing & /trips/[slug].
          {templates.length === 0 && (
            <span className="text-warning">
              {" "}Chưa có template — chạy <code className="rounded bg-surface-2 px-1.5">pnpm seed:trips</code>{" "}
              hoặc thêm mới ở dưới.
            </span>
          )}
        </p>
      </div>

      <TripTemplatesEditor initial={templates} />
    </div>
  );
}
