import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Map-VN" };

export default async function AdminDashboard() {
  const supabase = createServiceClient();

  const [{ count: pendingPlaces }, { count: pendingReviews }] = await Promise.all([
    supabase
      .from("place_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const stats = [
    { label: "Địa điểm chờ duyệt", value: pendingPlaces ?? 0, href: "/admin/places", color: "text-amber-600" },
    { label: "Reviews chờ duyệt", value: pendingReviews ?? 0, href: "/admin/reviews", color: "text-blue-600" },
  ];

  return (
    <div>
      <h1 className="font-display text-display-sm text-text">Dashboard</h1>
      <p className="mt-1 text-body text-text-muted">Tổng quan hệ thống moderation.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
          >
            <span className={`font-display text-4xl font-bold tabular-nums ${s.color}`}>
              {s.value}
            </span>
            <span className="text-body-sm text-text-muted">{s.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
