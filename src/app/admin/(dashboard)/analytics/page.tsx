import { getProducts } from "@/lib/firebase/services/products";
import { getAffiliateLinkByProductId } from "@/lib/firebase/services/affiliateLinks";
import { BarChart3, MousePointerClick, TrendingUp, Sparkles } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const products = await getProducts({ status: "published", limitCount: 50 });

  // Fetch click counts for published products
  const productClickStats = await Promise.all(
    products.map(async (p) => {
      const link = await getAffiliateLinkByProductId(p.id);
      return {
        product: p,
        clickCount: link?.clickCount || 0,
      };
    })
  );

  // Sort by highest click count
  productClickStats.sort((a, b) => b.clickCount - a.clickCount);
  const totalClicks = productClickStats.reduce((acc, curr) => acc + curr.clickCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">วิเคราะห์ข้อมูล (Analytics Overview)</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          รายงานการคลิกลิงก์ Affiliate และประสิทธิภาพการทำงานของเว็บไซต์
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-gray-500 font-medium">จำนวนคลิก Affiliate รวม</span>
            <p className="text-2xl font-extrabold text-orange-600 mt-1">{totalClicks.toLocaleString()} ครั้ง</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
            <MousePointerClick className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-gray-500 font-medium">จำนวนสินค้าที่มีลิงก์</span>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{products.length} รายการ</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-gray-500 font-medium">การติดตาม Analytics</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">Firebase Ready</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top Clicked Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-bold text-gray-900">สินค้าที่มีการคลิกมากที่สุด (Top Clicked Products)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">อันดับ</th>
                <th className="px-6 py-3">ชื่อสินค้า</th>
                <th className="px-6 py-3">ราคา</th>
                <th className="px-6 py-3 text-right">จำนวนคลิก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productClickStats.map((item, idx) => (
                <tr key={item.product.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-400 text-xs">#{idx + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.product.name}</td>
                  <td className="px-6 py-4 font-bold text-orange-600">฿{item.product.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-800 font-extrabold text-xs rounded-full">
                      {item.clickCount} ครั้ง
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
