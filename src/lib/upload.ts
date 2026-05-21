"use client";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Upload a File to the `photos` Supabase Storage bucket.
 * Returns the public URL on success, or null if upload fails / not configured.
 * Files are stored under `{userId}/{timestamp}.{ext}` for per-user isolation.
 */
export async function uploadPhoto(file: File, userId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("photos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error || !data) return null;

  const { data: { publicUrl } } = supabase.storage
    .from("photos")
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Convert a data URL to a File object, then upload to Storage.
 * Returns the public URL, or the original data URL as fallback.
 */
export async function uploadDataUrl(
  dataUrl: string,
  userId: string
): Promise<string> {
  if (!dataUrl.startsWith("data:") || !isSupabaseConfigured()) return dataUrl;

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = blob.type.split("/")[1] ?? "jpg";
    const file = new File([blob], `photo.${ext}`, { type: blob.type });
    const url = await uploadPhoto(file, userId);
    return url ?? dataUrl;
  } catch {
    return dataUrl;
  }
}

/**
 * Upload all data-URL photos in a list. Falls back to original data URL per item on error.
 */
export async function uploadPhotos(
  photos: string[],
  userId: string
): Promise<string[]> {
  return Promise.all(photos.map((p) => uploadDataUrl(p, userId)));
}
