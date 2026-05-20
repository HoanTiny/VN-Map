import type { PlaceSubmission } from "./types";

const KEY = "mapvn:submissions";
const EVENT = "mapvn:submissions:changed";

function readAll(): PlaceSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: PlaceSubmission[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT));
  } catch (e) {
    console.warn("mapvn:submissions write failed", e);
    throw new Error("Không thể lưu (có thể do ảnh quá lớn).");
  }
}

export function listSubmissions(): PlaceSubmission[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function addSubmission(
  input: Omit<PlaceSubmission, "id" | "createdAt" | "status">
): PlaceSubmission {
  const sub: PlaceSubmission = {
    ...input,
    id: cryptoId(),
    createdAt: Date.now(),
    status: "pending",
  };
  writeAll([sub, ...readAll()]);
  return sub;
}

export function deleteSubmission(id: string) {
  writeAll(readAll().filter((s) => s.id !== id));
}

export function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
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
