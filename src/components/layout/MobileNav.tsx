"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Video, Scale, Bot, Grid } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "หน้าแรก", href: "/", icon: Home },
    { label: "กล้องทั้งหมด", href: "/products", icon: Video },
    { label: "เทียบราคา", href: "/compare", icon: Scale },
    { label: "AI ช่วยเลือก", href: "/ai-assistant", icon: Bot },
    { label: "หมวดหมู่", href: "/categories", icon: Grid },
  ];

  // Hide mobile bottom nav in admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-1 py-1 shadow-lg">
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
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-orange-600 bg-orange-50/80 scale-105"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? "text-orange-600" : "text-gray-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
