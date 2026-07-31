import Link from "next/link";
import { CategorySerialized } from "@/types/category";
import { Folder } from "lucide-react";

interface CategoryCardProps {
  category: CategorySerialized;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex items-center gap-4 hover:border-orange-500 hover:shadow-md transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
        <Folder className="w-6 h-6" />
      </div>

      <div className="overflow-hidden">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors truncate">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}
