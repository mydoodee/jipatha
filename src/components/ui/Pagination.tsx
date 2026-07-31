import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}page=${page}`;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className="flex items-center justify-center space-x-2 my-8" aria-label="Pagination">
      {hasPrev ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      <span className="text-xs sm:text-sm text-gray-600 font-medium px-3 py-1 bg-white border border-gray-200 rounded-lg">
        หน้า {currentPage} จาก {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
