"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductSerialized } from "@/types/product";
import { Sparkles, Bot, Send, ShoppingCart, ExternalLink, CheckCircle2, RefreshCw, Zap } from "lucide-react";
import { useCompare } from "@/context/CompareContext";

interface RecommendationItem {
  label: string;
  product: ProductSerialized;
  whyRecommend: string;
}

interface AIResponse {
  prompt: string;
  summary: string;
  recommendations: RecommendationItem[];
}

const PRESET_PROMPTS = [
  "งบ 3,000 ซื้อกล้องวงจรปิดรุ่นไหนดี",
  "งบไม่เกิน 1,000 บาท แนะนำตัวคุ้มๆ หน่อย",
  "กล้องโซล่าเซลล์ outdoor ไร้สาย ไม่เสียบปลั๊ก",
  "กล้อง 4G ใส่ซิม ไม่ต้องใช้เน็ตบ้าน สำหรับไร่สวน",
  "กล้องติดในบ้าน ดูแลเด็ก สัตว์เลี้ยง หมุน 360°",
];

export function AIAssistantWidget({ compact = false }: { compact?: boolean }) {
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { addToCompare, isInCompare } = useCompare();

  const handleConsultAI = async (queryText?: string) => {
    const textToSend = queryText || inputPrompt;
    if (!textToSend.trim()) return;

    setLoading(true);
    setError(null);
    setInputPrompt(textToSend);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend }),
      });

      if (!res.ok) {
        throw new Error("ไม่สามารถประมวลผลระบบ AI ได้ในขณะนี้");
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50/60 via-white to-orange-50/30 rounded-3xl p-6 sm:p-8 border-2 border-orange-200/80 shadow-xl shadow-orange-500/5 relative overflow-hidden">
      {/* Decorative Glow Backgrounds */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                AI ช่วยเลือกกล้องวงจรปิด
              </h2>
              <span className="bg-orange-100 text-orange-700 text-xs font-extrabold px-3 py-1 rounded-full border border-orange-200 flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                Smart AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
              พิมพ์งบประมาณ หรือรูปแบบการใช้งาน เช่น{" "}
              <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                &ldquo;งบ 3,000 ซื้อรุ่นไหนดี&rdquo;
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Input Box Form */}
      <div className="relative z-10 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConsultAI();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="ตัวอย่าง: งบ 3,000 ซื้อกล้องติดนอกบ้านตัวไหนดี?"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={loading}
            className="w-full pl-5 pr-36 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white text-sm sm:text-base font-semibold shadow-inner transition-all"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 text-xs sm:text-sm transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>กำลังคิด...</span>
              </>
            ) : (
              <>
                <span>ถาม AI</span>
                <Send className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        {/* Preset Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-gray-500 font-bold mr-1 flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            คำถามยอดฮิต:
          </span>
          {PRESET_PROMPTS.map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleConsultAI(promptText)}
              disabled={loading}
              className="text-xs bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 text-gray-700 hover:text-orange-700 px-3.5 py-1.5 rounded-full transition-all font-semibold shadow-xs text-left"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* AI Response Display */}
      {response && (
        <div className="relative z-10 mt-8 space-y-6 pt-6 border-t border-orange-100 animate-in fade-in duration-300">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-orange-800 font-extrabold uppercase tracking-wider">
                ผลการวิเคราะห์จาก AI
              </p>
              <p className="text-sm sm:text-base text-gray-800 font-semibold mt-1 leading-relaxed">
                {response.summary}
              </p>
            </div>
          </div>

          {/* Recommended Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {response.recommendations.map((rec) => {
              const { label, product, whyRecommend } = rec;
              const inCompare = isInCompare(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-5 flex flex-col justify-between hover:border-orange-400 hover:shadow-xl transition-all shadow-md group"
                >
                  <div>
                    {/* Badge Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                        {label}
                      </span>
                      {product.discountPercent && product.discountPercent > 0 && (
                        <span className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                          ลด {product.discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Image & Title */}
                    <div className="relative overflow-hidden rounded-xl bg-gray-50 aspect-video mb-3 border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images?.[0] || "/placeholder.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <Link href={`/products/${product.slug}`} className="hover:text-orange-600 transition-colors">
                      <h3 className="font-extrabold text-sm text-gray-900 line-clamp-2 leading-snug mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Why AI Recommends */}
                    <div className="bg-orange-50/80 border border-orange-100 rounded-xl p-3 mb-3 text-xs text-orange-950 font-medium">
                      <span className="font-bold text-orange-600 block mb-0.5">💡 เหตุผลที่ AI แนะนำ:</span>
                      {whyRecommend}
                    </div>

                    {/* Specs Quick List */}
                    <div className="space-y-1 text-xs text-gray-600 mb-4">
                      {product.resolution && (
                        <div className="flex justify-between border-b border-gray-100 py-1">
                          <span className="text-gray-500">ความละเอียด:</span>
                          <span className="font-bold text-gray-900">{product.resolution}</span>
                        </div>
                      )}
                      {product.nightVision && (
                        <div className="flex justify-between border-b border-gray-100 py-1">
                          <span className="text-gray-500">โหมดกลางคืน:</span>
                          <span className="font-bold text-gray-900 truncate max-w-[140px]">{product.nightVision}</span>
                        </div>
                      )}
                      {product.connectivity && (
                        <div className="flex justify-between py-1">
                          <span className="text-gray-500">การเชื่อมต่อ:</span>
                          <span className="font-bold text-gray-900">{product.connectivity}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-gray-500 font-semibold">ราคาพิเศษ</span>
                      <div className="text-right">
                        <span className="text-xl font-black text-orange-600">
                          ฿{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through ml-1.5">
                            ฿{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shopee Affiliate Direct Redirect Button */}
                    <Link
                      href={`/go/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <ShoppingCart className="w-4 h-4 text-white" />
                      <span>ซื้อผ่าน Shopee</span>
                      <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                    </Link>

                    {/* Compare Button */}
                    <button
                      type="button"
                      onClick={() => addToCompare(product)}
                      disabled={inCompare}
                      className={`w-full py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        inCompare
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {inCompare ? "✓ อยู่ในรายการเปรียบเทียบ" : "+ เพิ่มเข้าเปรียบเทียบ"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
