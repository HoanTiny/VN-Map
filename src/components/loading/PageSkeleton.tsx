import { Skeleton } from "@/ui/skeleton";

/**
 * Generic page-level skeleton matching the article + container + hero layout.
 * Used by route loading.tsx files for /saved, /trip, /submit etc.
 */
export function PageSkeleton({ withGrid = true }: { withGrid?: boolean }) {
  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>

        {withGrid && (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
