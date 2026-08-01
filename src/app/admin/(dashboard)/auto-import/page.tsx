"use client";

import { useState } from "react";
import { Bot, Play, CheckCircle2, AlertCircle, Clock, Zap, FileText, Sparkles, RefreshCw, Layers } from "lucide-react";

export default function AutoImportPage() {
  const [isCronRunning, setIsCronRunning] = useState(false);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchUrlsInput, setBatchUrlsInput] = useState("");
  const [cronLogs, setCronLogs] = useState<any | null>(null);
  const [batchLogs, setBatchLogs] = useState<any | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const handleRunAutoImportNow = async () => {
    setIsCronRunning(true);
    setCronLogs(null);
    setBanner({ type: "info", message: "กำลังรันระบบดึงสินค้าอัตโนมัติ กรุณารอสักครู่..." });

    try {
      const res = await fetch("/api/cron/auto-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.success) {
        setCronLogs(data.results);
        setBanner({
          type: "success",
          message: `✨ ดึงสินค้าสำเร็จ ${data.results.imported} รายการ (ข้ามสินค้าซ้ำ ${data.results.skipped} รายการ)`,
        });
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการดึงสินค้า");
      }
    } catch (err: any) {
      setBanner({ type: "error", message: `เกิดข้อผิดพลาด: ${err.message}` });
    } finally {
      setIsCronRunning(false);
    }
  };

  const handleRunBatchImport = async () => {
    const urls = batchUrlsInput
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http"));

    if (urls.length === 0) {
      setBanner({ type: "error", message: "กรุณาวางลิงก์ Shopee อย่างน้อย 1 ลิงก์ (บรรทัดละ 1 ลิงก์)" });
      return;
    }

    setIsBatchRunning(true);
    setBatchLogs(null);
    setBanner({ type: "info", message: `กำลังรันนำเข้าสินค้าแบบกลุ่ม ${urls.length} ลิงก์...` });

    try {
      const res = await fetch("/api/cron/auto-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();

      if (data.success) {
        setBatchLogs(data.results);
        setBanner({
          type: "success",
          message: `🎉 นำเข้าสำเร็จ ${data.results.imported} รายการ (ข้ามสินค้าซ้ำ ${data.results.skipped} รายการ)`,
        });
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการนำเข้าสินค้าแบบกลุ่ม");
      }
    } catch (err: any) {
      setBanner({ type: "error", message: `เกิดข้อผิดพลาด: ${err.message}` });
    } finally {
      setIsBatchRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">ระบบดึงสินค้าอัตโนมัติ (Auto-Importer)</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              ดึงและเพิ่มสินค้าจาก Shopee เข้าสู่ระบบอัตโนมัติด้วย Cron Job และระบบ Batch Import
            </p>
          </div>
        </div>
      </div>

      {banner && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            banner.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : banner.type === "error"
              ? "bg-rose-50 text-rose-800 border border-rose-200"
              : "bg-sky-50 text-sky-800 border border-sky-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : banner.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <RefreshCw className="w-4 h-4 text-sky-600 animate-spin" />
            )}
            <span>{banner.message}</span>
          </div>
          <button type="button" onClick={() => setBanner(null)} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
      )}

      {/* CRON STATUS CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ Vercel Cron</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ทำงานเปิดอยู่ (Active)
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">ทุกๆ 12 ชั่วโมง</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            ตารางเวลา: <code className="font-mono text-orange-600">0 */12 * * *</code>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">การกรองสินค้าซ้ำ</span>
          <p className="text-2xl font-black text-gray-900">อัตโนมัติ 100%</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            ระบบจะข้ามสินค้าที่มีชื่อ/URL ซ้ำในระบบโดยอัตโนมัติ
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">การสั่งรันแบบทันที</span>
          <button
            type="button"
            onClick={handleRunAutoImportNow}
            disabled={isCronRunning}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCronRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังดึงสินค้า...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>รันระบบดึงสินค้าทันที (Run Now)</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-gray-400 text-center">กดปุ่มนี้เพื่อดึงสินค้าหมวดหมู่นิยมเข้าสู่เว็บทันที</p>
        </div>
      </div>

      {/* CRON RUN RESULTS */}
      {cronLogs && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <span>ผลการรันดึงสินค้าแบบอัตโนมัติล่าสุด</span>
          </h3>

          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-500 block">ทั้งหมด</span>
              <span className="font-bold text-base text-gray-900">{cronLogs.total}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <span className="text-emerald-700 block">เพิ่มสำเร็จ</span>
              <span className="font-bold text-base text-emerald-700">{cronLogs.imported}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <span className="text-amber-700 block">ข้าม (ซ้ำ)</span>
              <span className="font-bold text-base text-amber-700">{cronLogs.skipped}</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl">
              <span className="text-rose-700 block">ล้มเหลว</span>
              <span className="font-bold text-base text-rose-700">{cronLogs.failed}</span>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100 text-xs">
            {cronLogs.items?.map((item: any, i: number) => (
              <div key={i} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50/50">
                <span className="font-medium text-gray-900 truncate">{item.title || item.url}</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-semibold text-[10px] flex-shrink-0 ${
                    item.status === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : item.status === "skipped"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {item.status === "success" ? "เพิ่มแล้ว" : item.status === "skipped" ? item.reason || "ซ้ำ" : "ล้มเหลว"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BATCH MULTI-LINK IMPORTER */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-extrabold text-gray-900">นำเข้าสินค้าแบบกลุ่ม (Batch Multi-Link Importer)</h2>
        </div>
        <p className="text-xs text-gray-500">
          วางลิงก์ Shopee หรือ Affiliate Link ที่ต้องการนำเข้าพร้อมกันได้หลายๆ ลิงก์ (วางบรรทัดละ 1 ลิงก์)
        </p>

        <textarea
          rows={6}
          value={batchUrlsInput}
          onChange={(e) => setBatchUrlsInput(e.target.value)}
          placeholder={`ตัวอย่าง:\nhttps://s.shopee.co.th/4Vbe7zo4fk\nhttps://shopee.co.th/product/1421404320/25294615650\nhttps://s.shopee.co.th/30mqNEV8CY`}
          className="w-full p-3 text-xs font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50/50"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400">
            จำนวนลิงก์ที่วาง:{" "}
            <strong className="text-purple-600 font-bold">
              {batchUrlsInput.split("\n").filter((u) => u.trim().startsWith("http")).length}
            </strong>{" "}
            ลิงก์
          </span>

          <button
            type="button"
            onClick={handleRunBatchImport}
            disabled={isBatchRunning}
            className="py-2.5 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isBatchRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังนำเข้า...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>นำเข้าทุกลิงก์พร้อมกัน (Batch Import)</span>
              </>
            )}
          </button>
        </div>

        {/* BATCH RUN RESULTS */}
        {batchLogs && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h4 className="font-bold text-xs text-gray-900">ผลการนำเข้าแบบกลุ่ม:</h4>
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block">ทั้งหมด</span>
                <span className="font-bold text-sm text-gray-900">{batchLogs.total}</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <span className="text-emerald-700 block">เพิ่มแล้ว</span>
                <span className="font-bold text-sm text-emerald-700">{batchLogs.imported}</span>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <span className="text-amber-700 block">ข้าม (ซ้ำ)</span>
                <span className="font-bold text-sm text-amber-700">{batchLogs.skipped}</span>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <span className="text-rose-700 block">ล้มเหลว</span>
                <span className="font-bold text-sm text-rose-700">{batchLogs.failed}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
