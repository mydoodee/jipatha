"use client";

import { useAuth } from "./AuthProvider";
import { LogOut, User as UserIcon } from "lucide-react";

export function AdminHeader() {
  const { profile, user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
          สิทธิ์การใช้งาน: <span className="text-orange-600 font-bold uppercase">{profile?.role || "Admin"}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <div className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
            <UserIcon className="w-4 h-4" />
          </div>
          <span className="font-semibold hidden sm:inline">{profile?.displayName || user?.email}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </button>
      </div>
    </header>
  );
}
