"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service silently if needed
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        เกิดข้อผิดพลาดในการโหลดข้อมูล
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
        ขออภัย เกิดข้อผิดพลาดชั่วคราวในการประมวลผลระบบ กรุณาลองใหม่อีกครั้ง หรือกลับสู่หน้าหลัก
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>ลองใหม่อีกครั้ง</span>
        </button>
        <Link
          href="/"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </Link>
      </div>
    </div>
  );
}
