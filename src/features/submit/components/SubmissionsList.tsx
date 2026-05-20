"use client";
import { useState } from "react";
import { Trash2, MapPin, Clock, Tag } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Badge } from "@/ui/badge";
import { IconButton } from "@/ui/icon-button";
import { spring } from "@/lib/motion";
import { useSubmissions } from "../hooks/useSubmissions";
import { categoryByKey } from "@/config/categories";
import type { SubmissionStatus } from "../lib/types";

const STATUS_META: Record<SubmissionStatus, { label: string; className: string }> = {
  pending: { label: "Đang chờ duyệt", className: "bg-warning/15 text-warning" },
  approved: { label: "Đã duyệt", className: "bg-success/15 text-success" },
  rejected: { label: "Bị từ chối", className: "bg-danger/15 text-danger" },
};

export function SubmissionsList() {
  const { submissions, hydrated, remove } = useSubmissions();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!hydrated) {
    return <p className="text-body-sm text-text-muted">Đang tải…</p>;
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="font-display text-h3 text-text">Chưa có đề xuất nào</p>
        <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">
          Bạn chưa đóng góp địa điểm nào. Bắt đầu với quán cafe yêu thích?
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {submissions.map((s) => {
          const cat = categoryByKey[s.category];
          const meta = STATUS_META[s.status];
          return (
            <m.li
              key={s.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={spring.default}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className={meta.className}>{meta.label}</Badge>
                    <Badge
                      variant="outline"
                      style={{ borderColor: cat.color, color: cat.color }}
                    >
                      {cat.labelVi}
                    </Badge>
                  </div>
                  <h3 className="font-display text-h3 text-text">{s.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-body-sm text-text-muted">
                    <MapPin size={12} />
                    <span>
                      {[s.district, s.province].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-body text-text">{s.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-caption text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} /> {formatDate(s.createdAt)}
                    </span>
                    {s.priceRange && (
                      <span className="font-mono">{s.priceRange}</span>
                    )}
                    {s.tags && s.tags.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Tag size={11} /> {s.tags.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <IconButton
                  label="Xoá đề xuất"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmId(confirmId === s.id ? null : s.id)}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>

              {confirmId === s.id && (
                <div className="mt-3 flex items-center justify-end gap-2 rounded-lg bg-danger/5 px-3 py-2 text-body-sm">
                  <span className="text-text-muted">Xoá đề xuất này?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="rounded px-2 py-1 text-text-muted hover:bg-surface-2"
                  >
                    Huỷ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      remove(s.id);
                      setConfirmId(null);
                    }}
                    className="rounded bg-danger px-2 py-1 text-white hover:brightness-110"
                  >
                    Xoá
                  </button>
                </div>
              )}
            </m.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

function formatDate(ms: number): string {
  const diff = (Date.now() - ms) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(ms).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" });
}
