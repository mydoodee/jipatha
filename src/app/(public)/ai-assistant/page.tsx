import { AIAssistantWidget } from "@/components/ai/AIAssistantWidget";
import { siteConfig } from "@/config/site";
import { ShieldCheck, Sparkles, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "AI ช่วยเลือกกล้องวงจรปิด ตามงบประมาณและสเปค | CCTV Master",
  description:
    "ถาม AI ช่วยเลือกกล้องวงจรปิดตามงบประมาณ (เช่น งบ 3,000 ซื้อรุ่นไหนดี) การใช้งานในบ้าน นอกบ้าน โซล่าเซลล์ 4G คัดสรรรุ่นดีที่สุดพร้อมลิงก์ส่วนลด Shopee",
};

export default function AIAssistantPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border border-orange-200">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span>ระบบ AI แนะนำกล้องวงจรปิดอัจฉริยะ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          ไม่แน่ใจว่าจะซื้อกล้องวงจรปิดรุ่นไหน? <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600">
            ถาม AI ช่วยวิเคราะห์ให้คุณได้ทันที!
          </span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          ระบุงบประมาณ เช่น <strong className="text-gray-900">&ldquo;งบ 3,000 ซื้อรุ่นไหนดี&rdquo;</strong> หรือความต้องการในการติดตั้ง (ในบ้าน นอกบ้าน โซล่าเซลล์ 4G ใส่ซิม) AI จะประมวลผลและคัดเลือก 3 รุ่นที่ดีที่สุดพร้อมส่วนลดพิเศษจาก Shopee ให้คุณทันที
        </p>
      </div>

      {/* Main AI Assistant Widget */}
      <AIAssistantWidget />

      {/* Benefits section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            💰
          </div>
          <h3 className="font-extrabold text-base text-gray-900">วิเคราะห์ตามงบประมาณจริง</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            ไม่ว่าจะมีงบ 500.-, 1,500.- หรือ 3,000.- AI จะเลือกกล้องรุ่นที่คุ้มค่าและให้สเปคสูงสุดในงบนั้นๆ
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            📡
          </div>
          <h3 className="font-extrabold text-base text-gray-900">ตรงสเปคการใช้งาน</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            ระบุความต้องการได้ทั้ง แบบติดในบ้าน, นอกบ้านกันน้ำ, พลังงานโซล่าเซลล์ หรือแบบใส่ซิม 4G ไม่ต้องใช้เน็ตบ้าน
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            🛒
          </div>
          <h3 className="font-extrabold text-base text-gray-900">ซื้อตรงกับ Shopee Affiliate</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            ทุกรุ่นที่ AI แนะนำ มีปุ่มกดตรงเข้า Shopee เพื่อรับส่วนลดพิเศษ คูปองส่งฟรี และการการันตีจาก Shopee
          </p>
        </div>
      </div>
    </div>
  );
}
