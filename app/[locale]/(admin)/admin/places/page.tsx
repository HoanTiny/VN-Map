import { getLocale, getTranslations } from "next-intl/server";
import { createServiceClient } from "@/lib/supabase/server";
import { approveSubmission, rejectSubmission } from "@/features/admin/actions";
import { Badge } from "@/ui/badge";
import { categoryByKey } from "@/config/categories";

export async function generateMetadata() {
  const t = await getTranslations("Admin");
  return { title: t("metaPlacesApprove") };
}

export default async function AdminPlacesPage() {
  const [t, locale] = await Promise.all([getTranslations("Admin"), getLocale()]);
  const dateLocale = locale === "en" ? "en-US" : "vi-VN";
  const statusLabel = (s: string) =>
    s === "pending" ? t("statusPending")
      : s === "approved" ? t("statusApproved")
      : s === "rejected" ? t("statusRejected")
      : s;
  const catLocale = locale === "en";

  const supabase = createServiceClient();
  const { data: submissions } = await supabase
    .from("place_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (submissions ?? []) as Array<{
    id: string;
    name: string;
    category: string;
    province: string;
    address: string | null;
    description: string;
    lng: number;
    lat: number;
    submitted_by: string;
    status: string;
    created_at: string;
  }>;

  return (
    <div>
      <h1 className="font-display text-display-sm text-text">{t("placesApproveTitle")}</h1>
      <p className="mt-1 text-body text-text-muted">{t("placesApproveCount", { count: rows.length })}</p>

      <div className="mt-6 space-y-3">
        {rows.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-body-sm text-text-muted">
            {t("placesApproveEmpty")}
          </p>
        )}
        {rows.map((s) => {
          const cat = categoryByKey[s.category as keyof typeof categoryByKey];
          return (
            <div
              key={s.id}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-h3 text-text">{s.name}</span>
                    {cat && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-caption text-brand-700">
                        {catLocale ? cat.label : cat.labelVi}
                      </span>
                    )}
                    <Badge
                      variant={s.status === "pending" ? "outline" : s.status === "approved" ? "brand" : "outline"}
                    >
                      {statusLabel(s.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-body-sm text-text-muted">
                    {s.province}{s.address ? ` · ${s.address}` : ""} · {s.lng.toFixed(5)}, {s.lat.toFixed(5)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-body text-text">{s.description}</p>
                  <p className="mt-1 text-caption text-text-subtle">
                    {t.rich("submittedBy", {
                      user: s.submitted_by,
                      date: new Date(s.created_at).toLocaleDateString(dateLocale),
                      b: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>
                </div>

                {s.status === "pending" && (
                  <div className="flex shrink-0 gap-2">
                    <form action={approveSubmission.bind(null, s.id)}>
                      <button
                        type="submit"
                        className="rounded-lg bg-success/10 px-3 py-1.5 text-body-sm font-medium text-success hover:bg-success/20"
                      >
                        {t("actionApprove")}
                      </button>
                    </form>
                    <form action={rejectSubmission.bind(null, s.id)}>
                      <button
                        type="submit"
                        className="rounded-lg bg-danger/10 px-3 py-1.5 text-body-sm font-medium text-danger hover:bg-danger/20"
                      >
                        {t("actionReject")}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
