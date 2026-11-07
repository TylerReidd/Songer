import { Skeleton } from "@/components/ui/skeleton";

export default function SongLoading() {
  return (
    <div className="flex min-h-dvh flex-col" aria-busy="true">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Skeleton className="size-8" />
        <Skeleton className="h-5 w-20" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
        </div>
      </div>
      <div className="flex flex-1">
        <div className="flex-1 bg-surface-editor">
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="mt-3 h-5 w-48" />
            <div className="mt-8 flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-36 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="hidden w-[320px] border-l lg:block" />
      </div>
    </div>
  );
}
