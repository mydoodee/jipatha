"use client";

import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { sampleCctvProducts } from "@/lib/data/cctvCatalog";
import { Scale, Trash2, ShoppingCart, ExternalLink, X, Sparkles } from "lucide-react";
import { AffiliateButton } from "@/components/affiliate/AffiliateButton";

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, addToCompare } = useCompare();

  // If user hasn't selected items, show compareList or empty
  const productsToDisplay = compareList;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            style={{ background: "linear-gradient(90deg, #ff5722 0%, #ff1744 100%)" }}
            className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-rose-500/25"
          >
            <Scale className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              เปรียบเทียบราคากล้องวงจรปิด & สเปค
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              เปรียบเทียบความละเอียด, โหมดกลางคืน, การเชื่อมต่อ, และดีลคุ้มที่สุดจาก Shopee แบบข้างต่อข้าง
            </p>
          </div>
        </div>

        {compareList.length > 0 && (
          <button
            onClick={clearCompare}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-xs sm:text-sm font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>ล้างการเปรียบเทียบ</span>
          </button>
        )}
      </div>

      {compareList.length === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-xs sm:text-sm text-orange-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span>
              คุณยังไม่ได้เลือกกล้องวงจรปิดเข้าเปรียบเทียบ ด้านล่างนี้คือ <strong>รุ่นตัวอย่างยอดฮิต</strong> คุณสามารถเลือกเพิ่มกล้องจากหน้ารายการสินค้าได้ครับ
            </span>
          </div>
        </div>
      )}

      {/* Comparison Table Grid */}
      <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr>
              <th className="w-1/4 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 rounded-tl-2xl">
                หัวข้อเปรียบเทียบ
              </th>
              {productsToDisplay.map((product) => (
                <th key={product.id} className="p-4 align-top w-1/4 min-w-[200px]">
                  <div className="relative group bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3 flex flex-col h-full">
                    {compareList.some((p) => p.id === product.id) && (
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-xs border border-gray-200 transition-colors"
                        title="ลบออก"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Image */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images?.[0] || "/placeholder.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Title */}
                    <Link href={`/products/${product.slug}`} className="hover:text-orange-600 transition-colors">
                      <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="pt-1">
                      <p className="text-xs text-gray-400">ราคาใน Shopee</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-orange-600">
                          ฿{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ฿{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shopee Direct Affiliate Button (Unified System Style) */}
                    <AffiliateButton
                      slug={product.slug}
                      size="sm"
                      label="เช็คราคา"
                      className="w-full text-xs font-bold py-2.5 mt-auto"
                    />

                    {!compareList.some((p) => p.id === product.id) && (
                      <button
                        onClick={() => addToCompare(product)}
                        className="w-full py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-xs rounded-full transition-colors"
                      >
                        + เพิ่มเข้าเปรียบเทียบ
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
            {/* Resolution */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/50">🎥 ความละเอียดภาพ</td>
              {productsToDisplay.map((p) => (
                <td key={p.id} className="p-4 font-semibold text-gray-900">
                  {p.resolution || "Full HD 1080P"}
                </td>
              ))}
            </tr>

            {/* Environment & Waterproof */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/50">🌧️ การติดตั้ง / กันน้ำ</td>
              {productsToDisplay.map((p) => (
                <td key={p.id} className="p-4 text-gray-900">
                  {p.waterproof ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                      Outdoor กันน้ำ IP66
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full text-xs">
                      🏠 ติดตั้งในบ้าน (Indoor)
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Night Vision */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/50">🌙 โหมดกลางคืน (Night Vision)</td>
              {productsToDisplay.map((p) => (
                <td key={p.id} className="p-4 text-gray-800 font-medium">
                  {p.nightVision || "Infrared Night Mode"}
                </td>
              ))}
            </tr>

            {/* Connectivity */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/50">📡 การเชื่อมต่ออินเทอร์เน็ต</td>
              {productsToDisplay.map((p) => (
                <td key={p.id} className="p-4 text-gray-800 font-medium">
                  {p.connectivity || "Wi-Fi 2.4GHz"}
                </td>
              ))}
            </tr>

            {/* Power Supply */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/50">🔌 แหล่งพลังงาน</td>
              {productsToDisplay.map((p) => (
                <td key={p.id} className="p-4 text-gray-800 font-medium">
                  {p.powerSupply || "DC Plug-in"}
                </td>
              ))}
            </tr>

            {/* AI Features */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/50">🤖 ฟีเจอร์ AI / แจ้งเตือน</td>
              {productsToDisplay.map((p) => (
                <td key={p.id} className="p-4 text-gray-700 space-y-1">
                  {p.aiFeatures && p.aiFeatures.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.aiFeatures.map((feat, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-[11px] px-2 py-0.5 rounded-md border border-gray-200">
                          {feat}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span>Motion Detection, Two-way Audio</span>
                  )}
                </td>
              ))}
            </tr>

            {/* View Angle */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/50">🔄 มุมมองการหมุน</td>
              {productsToDisplay.map((p) => (
                <td key={p.id} className="p-4 text-gray-800">
                  {p.viewAngle || "360° Horizontal Pan"}
                </td>
              ))}
            </tr>

            {/* Storage */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/50">💾 การบันทึกข้อมูล</td>
              {productsToDisplay.map((p) => (
                <td key={p.id} className="p-4 text-gray-800">
                  {p.storage || "MicroSD / Cloud"}
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/50">⭐ รีวิวความพึงพอใจ</td>
              {productsToDisplay.map((p) => (
                <td key={p.id} className="p-4 font-bold text-amber-600">
                  ⭐ {p.rating?.toFixed(1) || "4.9"} / 5.0
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
