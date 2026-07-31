"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, updateSiteSettings, SiteSettings } from "@/lib/firebase/services/settings";
import { Save, Check } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSubmitting(true);
    setMsg("");
    try {
      await updateSiteSettings(settings);
      setMsg("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-500">กำลังโหลดการตั้งค่า...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าเว็บไซต์ (Site Settings)</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          จัดการชื่อเว็บไซต์ คำอธิบาย และข้อความแสดงความยินยอม Affiliate
        </p>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {settings && (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-2xs">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ชื่อเว็บไซต์ (Site Name) *
            </label>
            <input
              type="text"
              required
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              คำอธิบายเว็บไซต์ (Site Description) *
            </label>
            <textarea
              rows={3}
              required
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ข้อความการเปิดเผย Affiliate (Affiliate Disclosure Notice) *
            </label>
            <textarea
              rows={3}
              required
              value={settings.affiliateDisclosure}
              onChange={(e) => setSettings({ ...settings, affiliateDisclosure: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
