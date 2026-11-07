import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" aria-busy="true">
      <div className="flex items-end justify-between">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-10">
          <div>
            <Skeleton className="h-6 w-40" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[110px] rounded-xl" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-4 h-20 rounded-xl" />
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-64" />
        </div>
      </div>
    </div>
  );
}
