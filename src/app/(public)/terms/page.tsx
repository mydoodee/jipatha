import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { constructMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import { FileText } from "lucide-react";

export const metadata = constructMetadata({
  title: `ข้อกำหนดการใช้งาน — ${siteConfig.name}`,
  description: `ข้อกำหนดและเงื่อนไขการใช้งานเว็บไซต์ ${siteConfig.name}`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: "ข้อกำหนดการใช้งาน" }]} />

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-orange-600" />
            <span>ข้อกำหนดการใช้งาน (Terms of Use)</span>
          </h1>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-4 leading-relaxed text-sm sm:text-base">
          <p>
            การเข้าชมและใช้งานเว็บไซต์ <strong className="text-orange-600">{siteConfig.name}</strong> ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขต่อไปนี้ หากคุณไม่ตกลงตามเงื่อนไข กรุณายุติตามการใช้งานเว็บไซต์
          </p>

          <h2 className="text-base sm:text-lg font-bold text-gray-900">1. การใช้งานเนื้อหา</h2>
          <p>
            เนื้อหา บทความ ข้อมูลสินค้า และรูปภาพบนเว็บไซต์นี้ จัดทำขึ้นเพื่อวัตถุประสงค์ในการให้ข้อมูลและรีวิวเท่านั้น ห้ามมิให้ทำซ้ำ ดัดแปลง หรือเผยแพร่ต่อเพื่อวัตถุประสงค์ทางการค้าโดยไม่ได้รับอนุญาต
          </p>

          <h2 className="text-base sm:text-lg font-bold text-gray-900">2. ข้อมูลราคาและสินค้า</h2>
          <p>
            ราคาสินค้า โปรโมชั่น และสต็อกสินค้าที่แสดงบนเว็บไซต์ อ้างอิงจากข้อมูลล่าสุดในเวลาที่ลงเนื้อหา ข้อมูลราคาจริงและเงื่อนไขการสั่งซื้อจะเป็นไปตามที่ระบุบนหน้าสินค้าของ Shopee ในขณะนั้นๆ
          </p>

          <h2 className="text-base sm:text-lg font-bold text-gray-900">3. ข้อจำกัดความรับผิดชอบ</h2>
          <p>
            {siteConfig.name} เป็นเว็บไซต์ให้ข้อมูลรีวิวและเปรียบเทียบราคาเท่านั้น เราไม่ใช่ผู้จำหน่ายสินค้าโดยตรง การชำระเงิน การจัดส่ง และการรับประกันสินค้าจะเป็นความรับผิดชอบของร้านค้าผู้ขายบน Shopee
          </p>
        </div>
      </div>
    </div>
  );
}
