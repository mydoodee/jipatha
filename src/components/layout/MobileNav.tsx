"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Grid, BookOpen, Search } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "หน้าแรก", href: "/", icon: Home },
    { label: "สินค้า", href: "/products", icon: Package },
    { label: "หมวดหมู่", href: "/categories", icon: Grid },
    { label: "บทความ", href: "/blog", icon: BookOpen },
    { label: "ค้นหา", href: "/search", icon: Search },
  ];

  // Hide mobile bottom nav in admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
