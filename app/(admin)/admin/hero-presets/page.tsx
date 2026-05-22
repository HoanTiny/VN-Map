import { getAllHeroPresetsAdmin } from "@/features/admin/lib/hero-presets-queries";
import { HeroPresetsEditor } from "@/features/admin/components/HeroPresetsEditor";

export const metadata = { title: "Hero Background · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminHeroPresetsPage() {
  const presets = await getAllHeroPresetsAdmin();

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm text-text">Hero background</h1>
          <p className="mt-1 text-body text-text-muted">
            Ảnh nền landing hero auto-adapt theo thời điểm và vùng IP user.
            {presets.length === 0 && (
              <span className="text-warning">
                {" "}Chưa có preset nào — chạy <code className="rounded bg-surface-2 px-1.5">pnpm seed:hero</code> hoặc thêm mới ở dưới.
              </span>
            )}
          </p>
        </div>
      </div>

      <HeroPresetsEditor initial={presets} />
    </div>
  );
}
