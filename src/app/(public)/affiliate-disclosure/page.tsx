import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { constructMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import { Info, ShoppingBag, ShieldCheck } from "lucide-react";

export const metadata = constructMetadata({
  title: `การเปิดเผยข้อความ Affiliate — ${siteConfig.name}`,
  description: `คำชี้แจงความสัมพันธ์แบบ Affiliate ระหว่าง ${siteConfig.name} และ Shopee`,
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: "การเปิดเผย Affiliate" }]} />

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Info className="w-7 h-7 text-orange-600" />
            <span>การเปิดเผยข้อความ Affiliate (Affiliate Disclosure)</span>
          </h1>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-orange-900 font-medium text-sm sm:text-base leading-relaxed">
          &ldquo;{siteConfig.affiliateDisclosure}&rdquo;
        </div>

        <div className="prose max-w-none text-gray-700 space-y-4 leading-relaxed text-sm sm:text-base">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <span>หลักการทำงานและเป้าหมาย</span>
          </h2>
          <p>
            {siteConfig.name} เข้าร่วมโปรแกรม Affiliate Marketing กับ Shopee Thailand ในฐานะพาร์ทเนอร์อิสระ เป้าหมายของเราคือการรวบรวมข้อมูลสินค้า แนะนำสินค้าน่าซื้อ และรีวิวสินค้าที่เป็นประโยชน์ต่อการตัดสินใจช้อปปิ้งของผู้ใช้งาน
          </p>

          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <span>ผลกระทบต่อผู้ซื้อ</span>
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>คุณสั่งซื้อสินค้าได้ในราคาปกติหรือราคาโปรโมชั่นตามเดิมโดยไม่มีค่าใช้จ่ายเพิ่ม</li>
            <li>ราคาสินค้า คูปองส่วนลด และการส่งฟรีบน Shopee เป็นไปตามเงื่อนไขปกติของร้านค้า</li>
            <li>การสั่งซื้อ ชำระเงิน และการจัดส่งทั้งหมดดำเนินการบนระบบของ Shopee โดยตรง</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
