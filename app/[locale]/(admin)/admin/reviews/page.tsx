import { getLocale, getTranslations } from "next-intl/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rejectReview, approveReview } from "@/features/admin/actions";
import { Badge } from "@/ui/badge";
import { RatingStars } from "@/features/review/components/RatingStars";

export async function generateMetadata() {
  const t = await getTranslations("Admin");
  return { title: t("metaReviews") };
}

const STATUS_VARIANT: Record<string, "brand" | "outline"> = {
  approved: "brand",
  pending: "outline",
  rejected: "outline",
};

export default async function AdminReviewsPage() {
  const [t, locale] = await Promise.all([getTranslations("Admin"), getLocale()]);
  const dateLocale = locale === "en" ? "en-US" : "vi-VN";

  const supabase = createServiceClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (reviews ?? []) as Array<{
    id: string;
    place_slug: string;
    author_name: string;
    rating: number;
    title: string | null;
    body: string;
    status: string;
    created_at: string;
  }>;

  return (
    <div>
      <h1 className="font-display text-display-sm text-text">{t("reviewsTitle")}</h1>
      <p className="mt-1 text-body text-text-muted">{t("reviewsCount", { count: rows.length })}</p>

      <div className="mt-6 space-y-3">
        {rows.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-body-sm text-text-muted">
            {t("reviewsEmpty")}
          </p>
        )}
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-text">{r.author_name}</span>
                  <RatingStars value={r.rating as 1|2|3|4|5} readOnly size={14} />
                  <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>
                    {r.status === "pending" ? t("statusPending") : r.status === "approved" ? t("statusApproved") : r.status === "rejected" ? t("statusRejected") : r.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-caption text-text-muted">
                  {r.place_slug} · {new Date(r.created_at).toLocaleDateString(dateLocale)}
                </p>
                {r.title && <p className="mt-2 font-medium text-text">{r.title}</p>}
                <p className="mt-1 line-clamp-3 text-body text-text">{r.body}</p>
              </div>

              <div className="flex shrink-0 gap-2">
                {r.status !== "approved" && (
                  <form action={approveReview.bind(null, r.id)}>
                    <button
                      type="submit"
                      className="rounded-lg bg-success/10 px-3 py-1.5 text-body-sm font-medium text-success hover:bg-success/20"
                    >
                      {t("actionApprove")}
                    </button>
                  </form>
                )}
                {r.status !== "rejected" && (
                  <form action={rejectReview.bind(null, r.id)}>
                    <button
                      type="submit"
                      className="rounded-lg bg-danger/10 px-3 py-1.5 text-body-sm font-medium text-danger hover:bg-danger/20"
                    >
                      {t("actionReject")}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
