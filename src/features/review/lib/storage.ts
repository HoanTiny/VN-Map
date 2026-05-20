import type { Review } from "./types";

const KEY = "mapvn:reviews";
const EVENT = "mapvn:reviews:changed";

function readAll(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeAll(items: Review[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    // Notify all useReviews subscribers in this tab.
    window.dispatchEvent(new Event(EVENT));
  } catch (e) {
    // Quota exceeded — most likely from too many photo data URLs.
    console.warn("mapvn:reviews write failed", e);
    throw new Error("Không thể lưu review (có thể do ảnh quá lớn).");
  }
}

export function listReviewsBySlug(slug: string): Review[] {
  return readAll().filter((r) => r.placeSlug === slug);
}

export function addReview(input: Omit<Review, "id" | "createdAt" | "status">): Review {
  const review: Review = {
    ...input,
    id: cryptoId(),
    createdAt: Date.now(),
    // In the localStorage Phase 1 demo we auto-approve so the user sees it
    // immediately. Real backend pipeline will introduce moderation queue.
    status: "approved",
  };
  const all = readAll();
  writeAll([review, ...all]);
  return review;
}

export function deleteReview(id: string) {
  writeAll(readAll().filter((r) => r.id !== id));
}

export function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  // Same-tab updates fire EVENT. Other-tab updates fire native "storage".
  const handler = () => onChange();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === KEY) onChange();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
