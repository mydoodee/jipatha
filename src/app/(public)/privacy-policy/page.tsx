import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { constructMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import { Shield } from "lucide-react";

export const metadata = constructMetadata({
  title: `นโยบายความเป็นส่วนตัว — ${siteConfig.name}`,
  description: `นโยบายการเก็บรวบรวม การใช้งาน และการคุ้มครองข้อมูลส่วนบุคคลของเว็บไซต์ ${siteConfig.name}`,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: "นโยบายความเป็นส่วนตัว" }]} />

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-orange-600" />
            <span>นโยบายความเป็นส่วนตัว (Privacy Policy)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            ปรับปรุงล่าสุดเมื่อ: {new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-4 leading-relaxed text-sm sm:text-base">
          <p>
            เว็บไซต์ <strong className="text-orange-600">{siteConfig.name}</strong> ให้ความสำคัญสูงสุดกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ เอกสารฉบับนี้อธิบายถึงประเภทข้อมูลที่เราจัดเก็บ วิธีการนำข้อมูลไปใช้ และสิทธิของคุณเกี่ยวกับข้อมูลส่วนบุคคล
          </p>

          <h2 className="text-base sm:text-lg font-bold text-gray-900">1. ข้อมูลที่เราจัดเก็บ</h2>
          <p>
            เราอาจจัดเก็บข้อมูลการใช้งานทั่วไป เช่น ที่อยู่ IP ประเภทของเบราว์เซอร์ หน้าที่เข้าชม และระยะเวลาที่ใช้งาน โดยใช้คุกกี้ (Cookies) และบริการวิเคราะห์ข้อมูล เช่น Firebase Analytics เพื่อปรับปรุงประสิทธิภาพการทำงานของเว็บไซต์
          </p>

          <h2 className="text-base sm:text-lg font-bold text-gray-900">2. การใช้คุกกี้ (Cookies)</h2>
          <p>
            คุกกี้คือไฟล์ข้อความขนาดเล็กที่บันทึกบนอุปกรณ์ของคุณ เราใช้คุกกี้เพื่อจดจำความชอบในการใช้งาน วัดผลทราฟฟิก และติดตามการส่งต่อลิงก์ Affiliate ไปยัง Shopee เพื่อการวิเคราะห์ทางสถิติ
          </p>

          <h2 className="text-base sm:text-lg font-bold text-gray-900">3. ลิงก์ไปยังเว็บไซต์ภายนอก</h2>
          <p>
            เว็บไซต์ของเรามีลิงก์ไปยังแพลตฟอร์มภายนอก เช่น Shopee เมื่อคุณคลิกลิงก์ดังกล่าว คุณจะถูกส่งไปยังเว็บไซต์ของบุคคลที่สาม ซึ่งมีนโยบายความเป็นส่วนตัวแยกเป็นของตนเอง เราขอแนะนำให้คุณอ่านนโยบายของเว็บไซต์เหล่านั้นก่อนทำรายการ
          </p>

          <h2 className="text-base sm:text-lg font-bold text-gray-900">4. ความปลอดภัยของข้อมูล</h2>
          <p>
            เราใช้มาตรการความปลอดภัยมาตรฐานและการเข้ารหัสข้อมูลผ่าน Firebase เพื่อปกป้องข้อมูลจากการเข้าถึงโดยไม่ได้รับอนุญาต
          </p>
        </div>
      </div>
    </div>
  );
}
