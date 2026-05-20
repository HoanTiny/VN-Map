/**
 * LocalStorage-backed "saved places" — single source of truth for the
 * heart-toggle interaction across the app. Stored as an array of slugs
 * so it's tiny and stable.
 */

const KEY = "mapvn:saved";
const EVENT = "mapvn:saved:changed";

function readAll(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeAll(slugs: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event(EVENT));
}

export function listSaved(): string[] {
  return readAll();
}

export function isSaved(slug: string): boolean {
  return readAll().includes(slug);
}

export function toggleSaved(slug: string): boolean {
  const current = readAll();
  const exists = current.includes(slug);
  writeAll(exists ? current.filter((s) => s !== slug) : [slug, ...current]);
  return !exists;
}

export function save(slug: string) {
  const current = readAll();
  if (current.includes(slug)) return;
  writeAll([slug, ...current]);
}

export function unsave(slug: string) {
  writeAll(readAll().filter((s) => s !== slug));
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
