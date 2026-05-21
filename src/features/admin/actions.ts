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

  const slug = slugify((sub as { name: string }).name);

  const { error: insertErr } = await supabase.from("places").insert({
    slug,
    name: (sub as any).name,
    province: (sub as any).province,
    province_slug: (sub as any).province_slug,
    district: (sub as any).district,
    address: (sub as any).address,
    category: (sub as any).category,
    cover: ((sub as any).photos?.[0]) ?? "/covers/placeholder.jpg",
    highlight: (sub as any).description,
    price_range: (sub as any).price_range,
    opening_hours: (sub as any).opening_hours,
    tags: (sub as any).tags,
    source: "community",
    submitted_by: (sub as any).submitted_by,
    location: `POINT(${(sub as any).lng} ${(sub as any).lat})`,
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
