import { getProducts } from "@/lib/firebase/services/products";
import { getPosts } from "@/lib/firebase/services/posts";
import { Package, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [allProducts, publishedProducts, draftProducts, posts] = await Promise.all([
    getProducts({ status: undefined, limitCount: 100 }),
    getProducts({ status: "published", limitCount: 100 }),
    getProducts({ status: "draft", limitCount: 100 }),
    getPosts({ status: undefined, limitCount: 100 }),
  ]);

  const stats = [
    {
      title: "สินค้าทั้งหมด",
      value: allProducts.length,
      icon: Package,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      title: "สินค้าเผยแพร่",
      value: publishedProducts.length,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      title: "สินค้าฉบับร่าง",
      value: draftProducts.length,
      icon: Clock,
      color: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      title: "บทความทั้งหมด",
      value: posts.length,
      icon: FileText,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ (Dashboard)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            สรุปสถิติและข้อมูลการใช้งานแพลตฟอร์ม
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
        >
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between shadow-2xs"
            >
              <div>
                <span className="text-xs text-gray-500 font-medium">{stat.title}</span>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Products List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900">สินค้าล่าสุด</h2>
          <Link href="/admin/products" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
            ดูทั้งหมด
          </Link>
        </div>

        {allProducts.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">ยังไม่มีสินค้าในระบบ</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {allProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${product.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span className="font-medium text-gray-900 truncate max-w-xs">{product.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-bold text-orange-600">฿{product.price.toLocaleString()}</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${product.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {product.status === "published" ? "เผยแพร่" : "ฉบับร่าง"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
