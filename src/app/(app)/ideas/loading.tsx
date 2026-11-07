import { Skeleton } from "@/components/ui/skeleton";

export default function IdeasLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" aria-busy="true">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="mt-2 h-4 w-64" />
      <Skeleton className="mt-6 h-36 rounded-xl" />
      <Skeleton className="mt-8 h-9" />
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
