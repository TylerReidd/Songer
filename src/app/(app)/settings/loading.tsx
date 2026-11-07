import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" aria-busy="true">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-8 flex flex-col gap-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
