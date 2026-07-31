import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">404</h1>
      <h2 className="text-lg font-bold text-gray-800 mb-2">
        ไม่พบหน้าที่คุณต้องการ
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
        หน้าเว็บที่คุณกำลังพยายามเข้าถึงอาจถูกลบ เปลี่ยนชื่อ หรือไม่พร้อมใช้งานในขณะนี้
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </Link>
        <Link
          href="/search"
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>ค้นหาสินค้า</span>
        </Link>
      </div>
    </div>
  );
}
