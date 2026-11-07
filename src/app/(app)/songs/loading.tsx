import { Skeleton } from "@/components/ui/skeleton";

export default function SongsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" aria-busy="true">
      <div className="flex items-end justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="mt-6 h-9 w-full" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[118px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
