"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { useAuth } from "./AuthProvider";
import {
  LayoutDashboard,
  Package,
  Folder,
  BookOpen,
  Link as LinkIcon,
  Image as ImageIcon,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/products": Package,
  "/admin/categories": Folder,
  "/admin/posts": BookOpen,
  "/admin/affiliate": LinkIcon,
  "/admin/media": ImageIcon,
  "/admin/analytics": BarChart3,
  "/admin/settings": Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const { profile, user, logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 min-h-screen flex flex-col flex-shrink-0 border-r border-gray-800">
      {/* Brand */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt={siteConfig.name}
          className="w-8 h-8 object-cover rounded-lg"
        />
        <div>
          <span className="font-bold text-white text-base leading-none block">
            {siteConfig.name}
          </span>
          <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
        {adminNavigation.map((item) => {
          const Icon = iconMap[item.href] || Folder;
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-600 text-white font-semibold shadow-xs"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Public Site Link */}
      <div className="p-3 border-t border-gray-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <span>ดูหน้าเว็บไซต์หลัก</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-gray-800 space-y-2.5">
        {/* User Info */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {profile?.displayName || user?.email?.split("@")[0] || "Admin"}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-1.5 px-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-semibold text-gray-400">
            สิทธิ์: <span className="text-emerald-400 uppercase">{profile?.role || "Admin"}</span>
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
