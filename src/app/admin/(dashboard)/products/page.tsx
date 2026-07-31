import Link from "next/link";
import { getProducts } from "@/lib/firebase/services/products";
import { Plus, Edit, ExternalLink, Package } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getProducts({ status: "all", limitCount: 100 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            รายการสินค้าทั้งหมดในระบบ ({products.length} รายการ)
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสินค้าใหม่</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        {products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">ยังไม่มีสินค้าในระบบ</p>
            <p className="text-xs text-gray-400 mt-1">คลิกปุ่ม &quot;เพิ่มสินค้าใหม่&quot; ด้านบนเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">ชื่อสินค้า</th>
                  <th className="px-6 py-3">ราคา</th>
                  <th className="px-6 py-3">สถานะ</th>
                  <th className="px-6 py-3">แนะนำ</th>
                  <th className="px-6 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          />
                        )}
                        <div>
                          <span className="block font-semibold line-clamp-1">{product.name}</span>
                          <span className="text-xs text-gray-400 font-mono">{product.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-orange-600">
                      ฿{product.price.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          product.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {product.status === "published" ? "เผยแพร่" : "ฉบับร่าง"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                      {product.featured ? "ใช่" : "-"}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 rounded"
                        title="ดูหน้าเว็บ"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
