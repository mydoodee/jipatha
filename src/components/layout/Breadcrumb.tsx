import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { SeoJsonLd } from "@/components/seo/SeoJsonLd";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const schemaItems = [
    { name: "หน้าแรก", item: "/" },
    ...items.map((item) => ({
      name: item.label,
      item: item.href || "",
    })),
  ];

  return (
    <>
      <SeoJsonLd data={generateBreadcrumbSchema(schemaItems)} />
      <nav aria-label="Breadcrumb" className="py-3 px-1">
        <ol className="flex items-center space-x-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <li>
            <Link
              href="/"
              className="flex items-center text-gray-400 hover:text-orange-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="sr-only">หน้าแรก</span>
            </Link>
          </li>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-none">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
