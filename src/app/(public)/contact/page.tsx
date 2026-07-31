import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { constructMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import { Mail, MessageSquare, Send } from "lucide-react";

export const metadata = constructMetadata({
  title: `ติดต่อเรา — ${siteConfig.name}`,
  description: `ช่องทางการติดต่อทีมงาน ${siteConfig.name} สำหรับข้อสอบถาม เสนอแนะ หรือความร่วมมือทางธุรกิจ`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: "ติดต่อเรา" }]} />

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-orange-600" />
            <span>ติดต่อเรา</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            หากคุณมีข้อสงสัย คำแนะนำ หรือต้องการติดต่อลงโฆษณา สามารถติดต่อเราได้ผ่านแบบฟอร์มนี้
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Side */}
          <div className="space-y-4 text-sm text-gray-600 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900">สอบถามทั่วไป</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ยินดีรับฟังคำแนะนำและข้อเสนอแนะเพื่อพัฒนาเว็บไซต์
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Mail className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900">อีเมลติดต่อ</h3>
                <p className="text-xs text-gray-500 mt-0.5">contact@{siteConfig.url.replace(/^https?:\/\//, '')}</p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <form className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                required
                placeholder="ระบุชื่อของคุณ"
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                อีเมล
              </label>
              <input
                type="email"
                required
                placeholder="example@email.com"
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ข้อความ
              </label>
              <textarea
                rows={4}
                required
                placeholder="รายละเอียดเรื่องที่ต้องการติดต่อ..."
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>ส่งข้อความ</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
