"use client";
import { useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";
import { categoryByKey } from "@/config/categories";
import { provinceBySlug } from "@/config/regions";
import { useUIStore } from "@/stores/ui-store";

declare global {
  interface Window {
    __mapVN?: { flyTo: (lng: number, lat: number, zoom?: number) => void };
  }
}

const provinceByName = Object.fromEntries(
  Object.values(provinceBySlug).map((p) => [p.name.toLowerCase(), p])
);

function findProvince(name: string) {
  const key = name.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s*/i, "").trim();
  return (
    provinceByName[name.toLowerCase()] ??
    Object.values(provinceBySlug).find((p) =>
      p.name.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s*/i, "").trim() === key
    )
  );
}

interface Suggestion {
  name: string;
  province: string;
  category: string;
  address: string;
  reason: string;
  lat?: number;
  lng?: number;
}

interface AIResponse {
  message: string;
  suggestions: Suggestion[];
}

interface ConversationTurn {
  query: string;
  response: AIResponse | null;
  error?: string;
}

export function AISuggestPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    const q = query.trim();
    if (!q || loading) return;
    setQuery("");
    setLoading(true);
    setTurns((prev) => [...prev, { query: q, response: null }]);

    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lỗi không xác định");
      setTurns((prev) =>
        prev.map((t, i) => (i === prev.length - 1 ? { ...t, response: data } : t))
      );
    } catch (e) {
      setTurns((prev) =>
        prev.map((t, i) =>
          i === prev.length - 1
            ? { ...t, error: e instanceof Error ? e.message : "Lỗi không xác định" }
            : t
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!open && (
          <m.button
            key="ai-fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={spring.default}
            onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 200); }}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2.5 text-body-sm font-medium shadow-lg",
              "bg-brand-600 text-white hover:bg-brand-700",
              "border border-brand-500/30"
            )}
          >
            <Sparkles size={15} />
            Gợi ý AI
          </m.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <m.div
            key="ai-panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={spring.default}
            className={cn(
              "flex w-[min(92vw,360px)] flex-col overflow-hidden",
              "rounded-2xl border border-border bg-surface shadow-2xl",
              "max-h-[70vh]"
            )}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-brand-600" />
                <span className="font-display text-h3 text-text">Gợi ý AI</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <X size={15} />
              </button>
            </div>

            {/* Conversation */}
            <div className="min-h-0 flex-1 overflow-y-auto space-y-4 p-4">
              {turns.length === 0 && (
                <div className="space-y-2">
                  <p className="text-body-sm text-text-muted">Hỏi tôi về địa điểm phù hợp với bạn, ví dụ:</p>
                  {["Quán cafe view đẹp cho buổi sáng", "Chỗ ăn tối lãng mạn ở Hà Nội", "Địa điểm checkin ít người biết"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => { setQuery(ex); inputRef.current?.focus(); }}
                      className="block w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-left text-body-sm text-text hover:bg-surface-2/80"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}

              {turns.map((turn, i) => (
                <div key={i} className="space-y-3">
                  {/* User query */}
                  <div className="flex justify-end">
                    <span className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-600 px-3 py-2 text-body-sm text-white">
                      {turn.query}
                    </span>
                  </div>

                  {/* AI response */}
                  {turn.error ? (
                    <p className="rounded-xl bg-danger/10 px-3 py-2 text-body-sm text-danger">
                      {turn.error}
                    </p>
                  ) : turn.response ? (
                    <div className="space-y-2">
                      <p className="text-body-sm text-text">{turn.response.message}</p>
                      {turn.response.suggestions.map((s, j) => (
                        <SuggestionCard key={j} suggestion={s} />
                      ))}
                    </div>
                  ) : i === turns.length - 1 && loading ? (
                    <div className="flex items-center gap-2 text-body-sm text-text-muted">
                      <span className="inline-flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500"
                            style={{ animationDelay: `${d * 0.15}s` }}
                          />
                        ))}
                      </span>
                      Đang suy nghĩ…
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-border p-3">
              <div className={cn(
                "flex items-center gap-2 rounded-xl border bg-bg px-3 py-2",
                "focus-within:ring-2 focus-within:ring-brand-500/20",
                query.length > 150
                  ? "border-danger focus-within:border-danger"
                  : "border-border focus-within:border-brand-500"
              )}>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value.slice(0, 160))}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Bạn đang tìm gì?"
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent text-body text-text outline-none placeholder:text-text-muted disabled:opacity-50"
                />
                <button
                  onClick={submit}
                  disabled={!query.trim() || loading || query.length > 150}
                  className="shrink-0 rounded-lg bg-brand-600 p-1.5 text-white hover:bg-brand-700 disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </div>
              {query.length > 100 && (
                <p className={cn(
                  "mt-1 text-right text-caption",
                  query.length > 150 ? "text-danger" : "text-text-muted"
                )}>
                  {query.length}/150
                </p>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const cat = categoryByKey[suggestion.category as keyof typeof categoryByKey];
  const setPickedCoords = useUIStore((s) => s.setPickedCoords);

  const preset = {
    name: suggestion.name,
    category: suggestion.category,
    address: suggestion.address,
    description: suggestion.reason,
  };

  const flyToMap = () => {
    if (suggestion.lat && suggestion.lng) {
      window.__mapVN?.flyTo(suggestion.lng, suggestion.lat, 16);
      setPickedCoords({ lng: suggestion.lng, lat: suggestion.lat, ...preset });
    } else {
      const prov = findProvince(suggestion.province);
      if (prov) {
        window.__mapVN?.flyTo(prov.center[0], prov.center[1], 13);
        setPickedCoords({ lng: prov.center[0], lat: prov.center[1], ...preset });
      }
    }
  };

  const hasLocation = !!(suggestion.lat && suggestion.lng) || !!findProvince(suggestion.province);

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-text">{suggestion.name}</p>
          <p className="text-caption text-text-muted">
            {cat?.label ?? suggestion.category} · {suggestion.province}
          </p>
          {suggestion.address && (
            <p className="mt-0.5 text-caption text-text-muted">{suggestion.address}</p>
          )}
          <p className="mt-1 text-caption text-text-muted">{suggestion.reason}</p>
        </div>
        {hasLocation && (
          <button
            onClick={flyToMap}
            title="Xem trên bản đồ"
            className="shrink-0 flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-caption text-text-muted hover:bg-surface hover:text-text"
          >
            <MapPin size={11} />
            Xem
          </button>
        )}
      </div>
    </div>
  );
}
