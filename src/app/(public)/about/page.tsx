import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { constructMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import { ShoppingBag, ShieldCheck, Heart, Sparkles } from "lucide-react";

export const metadata = constructMetadata({
  title: `เกี่ยวกับเรา — ${siteConfig.name}`,
  description: `ทำความรู้จักกับ ${siteConfig.name} แพลตฟอร์มแนะนำและเปรียบเทียบสินค้า Shopee เพื่อช่วยคุณตัดสินใจซื้อได้อย่างมั่นใจ`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: "เกี่ยวกับเรา" }]} />

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-orange-600" />
            <span>เกี่ยวกับ {siteConfig.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            ศูนย์รวมข้อมูลสินค้าและการเปรียบเทียบราคาที่คุณไว้วางใจได้
          </p>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-4 leading-relaxed text-sm sm:text-base">
          <p>
            ยินดีต้อนรับสู่ <strong className="text-orange-600">{siteConfig.name}</strong> เราคือเว็บไซต์แนะนำสินค้า เปรียบเทียบราคา และรวบรวมโปรโมชั่นสินค้าคุณภาพจาก Shopee เพื่อให้ผู้บริโภคชาวไทยสามารถค้นหา คัดสรร และซื้อสินค้าที่ตรงความต้องการได้ในราคาที่คุ้มค่าที่สุด
          </p>

          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pt-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <span>ภารกิจของเรา</span>
          </h2>
          <p>
            ในยุคที่สินค้าออนไลน์มีหลากหลายเลือกจนอาจทำให้สับสน เรามุ่งมั่นที่จะเป็นเพื่อนคู่คิดในการช้อปปิ้ง โดยการคัดกรองสินค้าที่มีคุณภาพ รีวิวจากผู้ใช้จริง และส่งต่อลิงก์ไปยังร้านค้าทางการใน Shopee อย่างโปร่งใสและปลอดภัย
          </p>

          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pt-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <span>ความโปร่งใสและการทำงาน</span>
          </h2>
          <p>
            {siteConfig.name} ทำงานในรูปแบบ Affiliate Partner อิสระ เมื่อคุณคลิกไปยัง Shopee ผ่านลิงก์บนเว็บไซต์ของเราและทำการสั่งซื้อ เราอาจได้รับค่าตอบแทนเป็นคอมมิชชันเล็กน้อยจากผู้ขาย โดยที่คุณ<strong>ไม่ต้องเสียค่าใช้จ่ายเพิ่มเติมใดๆ</strong> ทั้งสิ้น
          </p>

          <div className="bg-orange-50 rounded-xl p-4 flex items-center gap-3 border border-orange-100">
            <Heart className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-orange-900 font-medium">
              ขอบพระคุณทุกท่านที่ไว้วางใจและสนับสนุนเว็บไซต์ของเราในการส่งมอบข้อมูลสินค้าที่มีประโยชน์
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
