import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { libraryFiltersToSearchParams, type LibraryFilters } from "@/lib/songs/filters";
import { cn } from "@/lib/utils";

interface LibraryPaginationProps {
  filters: LibraryFilters;
  page: number;
  pageCount: number;
}

function hrefFor(filters: LibraryFilters, page: number): string {
  const params = libraryFiltersToSearchParams({ ...filters, page }).toString();
  return params ? `/songs?${params}` : "/songs";
}

/** Plain links, so paging works without JavaScript and keeps the filters in the URL. */
export function LibraryPagination({ filters, page, pageCount }: LibraryPaginationProps) {
  const link = (target: number, label: string, icon: React.ReactNode, disabled: boolean) =>
    disabled ? (
      <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none opacity-50")}>
        {icon}
        {label}
      </span>
    ) : (
      <Link href={hrefFor(filters, target)} className={buttonVariants({ variant: "outline", size: "sm" })}>
        {icon}
        {label}
      </Link>
    );

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between">
      {link(page - 1, "Previous", <ChevronLeft data-icon="inline-start" />, page <= 1)}
      <span className="text-xs text-text-muted">
        Page {page} of {pageCount}
      </span>
      {link(page + 1, "Next", <ChevronRight data-icon="inline-end" />, page >= pageCount)}
    </nav>
  );
}
