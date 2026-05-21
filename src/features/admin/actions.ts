"use server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

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
  const supabase = createServiceClient();

  const { data: sub, error: fetchErr } = await supabase
    .from("place_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !sub) throw new Error("Không tìm thấy đề xuất");

  type Sub = {
    name: string; province: string; province_slug: string; district?: string;
    address?: string; category: string; photos?: string[]; description?: string;
    price_range?: string; opening_hours?: string; tags?: string[];
    submitted_by?: string; lng: number; lat: number;
  };
  const s = sub as Sub;
  const slug = slugify(s.name);

  const { error: insertErr } = await supabase.from("places").insert({
    slug,
    name: s.name,
    province: s.province,
    province_slug: s.province_slug,
    district: s.district,
    address: s.address,
    category: s.category,
    cover: s.photos?.[0] ?? "/covers/placeholder.jpg",
    highlight: s.description,
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
  const supabase = createServiceClient();
  await supabase
    .from("place_submissions")
    .update({ status: "rejected" } as never)
    .eq("id", id);
  revalidatePath("/admin/places");
}

export async function rejectReview(id: string) {
  const supabase = createServiceClient();
  await supabase
    .from("reviews")
    .update({ status: "rejected" } as never)
    .eq("id", id);
  revalidatePath("/admin/reviews");
}

export async function approveReview(id: string) {
  const supabase = createServiceClient();
  await supabase
    .from("reviews")
    .update({ status: "approved" } as never)
    .eq("id", id);
  revalidatePath("/admin/reviews");
}
