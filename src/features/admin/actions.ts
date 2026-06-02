"use server";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const ADMIN_ROLES = ["admin", "mod", "editor"] as const;

async function requireAdminRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!ADMIN_ROLES.includes(profile?.role as typeof ADMIN_ROLES[number])) {
    throw new Error("Forbidden: insufficient role");
  }
}

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

export async function approveSubmission(id: string) {
  await requireAdminRole();
  const supabase = createServiceClient();

  const { data: sub, error: fetchErr } = await supabase
    .from("place_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !sub) throw new Error("Không tìm thấy đề xuất");

  type Sub = {
    name: string; name_en?: string | null;
    province: string; province_slug: string; district?: string;
    address?: string; category: string; photos?: string[]; description?: string;
    description_en?: string | null;
    price_range?: string; opening_hours?: string; tags?: string[];
    submitted_by?: string; lng: number; lat: number;
  };
  const s = sub as Sub;
  const slug = slugify(s.name);

  const { error: insertErr } = await supabase.from("places").insert({
    slug,
    name: s.name,
    name_en: s.name_en ?? null,
    province: s.province,
    province_slug: s.province_slug,
    district: s.district,
    address: s.address,
    category: s.category,
    cover: s.photos?.[0] ?? "/covers/placeholder.jpg",
    highlight: s.description,
    description_en: s.description_en ?? null,
    price_range: s.price_range,
    opening_hours: s.opening_hours,
    tags: s.tags,
    source: "community",
    submitted_by: s.submitted_by,
    location: `POINT(${s.lng} ${s.lat})`,
  } as never);

  if (insertErr) throw new Error("Lỗi tạo place: " + insertErr.message);

  await supabase
    .from("place_submissions")
    .update({ status: "approved" } as never)
    .eq("id", id);

  revalidatePath("/admin/places");
  revalidatePath("/explore");
}

export async function rejectSubmission(id: string) {
  await requireAdminRole();
  const supabase = createServiceClient();
  await supabase
    .from("place_submissions")
    .update({ status: "rejected" } as never)
    .eq("id", id);
  revalidatePath("/admin/places");
}

export async function rejectReview(id: string) {
  await requireAdminRole();
  const supabase = createServiceClient();
  await supabase
    .from("reviews")
    .update({ status: "rejected" } as never)
    .eq("id", id);
  revalidatePath("/admin/reviews");
}

export interface PlacePatch {
  name?: string;
  cover?: string;
  highlight?: string | null;
  address?: string | null;
  province?: string;
  category?: string;
  price_range?: "$" | "$$" | "$$$" | "$$$$" | null;
  opening_hours?: string | null;
  tags?: string[] | null;
}

export async function updatePlace(id: string, patch: PlacePatch) {
  await requireAdminRole();
  const supabase = createServiceClient();
  const cleaned = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  );
  if (Object.keys(cleaned).length === 0) return;

  const { error } = await supabase
    .from("places")
    .update(cleaned as never)
    .eq("id", id);

  if (error) throw new Error("Lỗi cập nhật place: " + error.message);

  revalidatePath("/admin/places/list");
  revalidatePath("/explore");
  revalidatePath("/");
}

/* ----------------------- Hero presets (CMS) ----------------------- */

export interface HeroImagePatch { src: string; alt: string }
export interface HeroTimePresetPatch { images: HeroImagePatch[]; overlay: string }
export interface HeroPresetInput {
  region: string;
  label: string;
  match_keywords: string[];
  presets: {
    day: HeroTimePresetPatch;
    sunset: HeroTimePresetPatch;
    night: HeroTimePresetPatch;
  };
  is_default?: boolean;
  enabled?: boolean;
  display_order?: number;
}

function revalidateHero() {
  revalidatePath("/admin/hero-presets");
  revalidatePath("/");
}

export async function upsertHeroPreset(id: string | null, patch: Partial<HeroPresetInput>) {
  await requireAdminRole();
  const supabase = createServiceClient();

  if (patch.is_default === true) {
    // Only one row can be default.
    await supabase
      .from("hero_presets")
      .update({ is_default: false } as never)
      .neq("id", id ?? "00000000-0000-0000-0000-000000000000");
  }

  if (id) {
    const { error } = await supabase
      .from("hero_presets")
      .update(patch as never)
      .eq("id", id);
    if (error) throw new Error("Lỗi cập nhật preset: " + error.message);
  } else {
    if (!patch.region || !patch.label || !patch.presets) {
      throw new Error("Thiếu region / label / presets khi tạo mới");
    }
    const { error } = await supabase.from("hero_presets").insert(patch as never);
    if (error) throw new Error("Lỗi tạo preset: " + error.message);
  }

  revalidateHero();
}

export async function deleteHeroPreset(id: string) {
  await requireAdminRole();
  const supabase = createServiceClient();
  const { error } = await supabase.from("hero_presets").delete().eq("id", id);
  if (error) throw new Error("Lỗi xoá preset: " + error.message);
  revalidateHero();
}

export async function toggleHeroPresetEnabled(id: string, enabled: boolean) {
  await requireAdminRole();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("hero_presets")
    .update({ enabled } as never)
    .eq("id", id);
  if (error) throw new Error("Lỗi đổi trạng thái: " + error.message);
  revalidateHero();
}

/* ----------------------- Curated trip templates (CMS) ----------------------- */

export interface TripTemplateInput {
  slug: string;
  title: string;
  summary: string;
  cover: string;
  duration_days: number;
  season: "spring" | "summer" | "autumn" | "winter" | "tet" | "national_day" | "any";
  destinations: string[];
  tags: string[];
  days: Array<{ label: string; placeSlugs: string[]; note?: string; date?: string }>;
  display_order?: number;
  enabled?: boolean;
}

function revalidateTripTemplates() {
  revalidatePath("/admin/trip-templates");
  revalidatePath("/");
}

export async function upsertTripTemplate(
  id: string | null,
  patch: Partial<TripTemplateInput>
) {
  await requireAdminRole();
  const supabase = createServiceClient();

  if (id) {
    const { error } = await supabase
      .from("trip_templates")
      .update(patch as never)
      .eq("id", id);
    if (error) throw new Error("Lỗi cập nhật template: " + error.message);
  } else {
    if (!patch.slug || !patch.title || !patch.cover || !patch.days) {
      throw new Error("Thiếu slug / title / cover / days khi tạo mới");
    }
    const { error } = await supabase
      .from("trip_templates")
      .insert(patch as never);
    if (error) throw new Error("Lỗi tạo template: " + error.message);
  }

  if (patch.slug) revalidatePath(`/trips/${patch.slug}`);
  revalidateTripTemplates();
}

export async function deleteTripTemplate(id: string) {
  await requireAdminRole();
  const supabase = createServiceClient();
  const { error } = await supabase.from("trip_templates").delete().eq("id", id);
  if (error) throw new Error("Lỗi xoá template: " + error.message);
  revalidateTripTemplates();
}

export async function toggleTripTemplateEnabled(id: string, enabled: boolean) {
  await requireAdminRole();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("trip_templates")
    .update({ enabled } as never)
    .eq("id", id);
  if (error) throw new Error("Lỗi đổi trạng thái: " + error.message);
  revalidateTripTemplates();
}

export async function approveReview(id: string) {
  await requireAdminRole();
  const supabase = createServiceClient();
  await supabase
    .from("reviews")
    .update({ status: "approved" } as never)
    .eq("id", id);
  revalidatePath("/admin/reviews");
}
