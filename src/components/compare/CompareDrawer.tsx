"use client";

import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { X, Scale, Trash2, ArrowRight } from "lucide-react";

export function CompareDrawer() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        width: "calc(100% - 24px)",
        maxWidth: "880px",
        backgroundColor: "#ffffff",
        color: "#0f172a",
      }}
      className="fixed bottom-[64px] md:bottom-[16px] rounded-2xl p-2 sm:p-3 shadow-2xl border-2 border-orange-300 overflow-hidden bg-white text-gray-900 transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-2 w-full">
        {/* Left Title & Counter */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            style={{ background: "linear-gradient(90deg, #ff5722 0%, #ff1744 100%)" }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-rose-500/20 flex-shrink-0"
          >
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <div>
            <p className="font-black text-[11px] sm:text-xs text-gray-900 leading-tight">
              เทียบกล้อง
            </p>
            <p className="text-[10px] text-orange-600 font-bold">
              {compareList.length}/4 รุ่น
            </p>
          </div>
        </div>

        {/* Middle Product List — Display ONLY Image & Price */}
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1 py-0.5 px-1 scrollbar-thin">
          {compareList.map((product) => (
            <div
              key={product.id}
              className="relative group rounded-xl p-1 bg-orange-50/80 border border-orange-200/90 flex items-center gap-1 flex-shrink-0 shadow-2xs hover:border-orange-400 transition-all"
            >
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images?.[0] || "/placeholder.jpg"}
                alt={product.name}
                className="w-7 h-7 sm:w-8 sm:h-8 object-cover rounded-md bg-white border border-gray-200 flex-shrink-0"
              />

              {/* Price ONLY */}
              <span className="text-[10px] sm:text-xs font-black text-orange-600 px-0.5 whitespace-nowrap">
                ฿{product.price.toLocaleString()}
              </span>

              {/* Delete Button (X) */}
              <button
                type="button"
                onClick={() => removeFromCompare(product.id)}
                className="w-4 h-4 bg-gray-200 hover:bg-red-500 text-gray-500 hover:text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                title="ลบออก"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Action Button (Unified System Button Style) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 px-2 py-1 rounded-xl hover:bg-gray-100 transition-colors font-semibold flex-shrink-0"
          >
            <Trash2 className="w-3 h-3" />
            <span>ล้าง</span>
          </button>
          <Link
            href="/compare"
            style={{ background: "linear-gradient(90deg, #ff5722 0%, #ff1744 100%)" }}
            className="inline-flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 text-white font-extrabold text-[11px] sm:text-xs rounded-full shadow-md shadow-rose-500/25 transition-all hover:brightness-105 active:scale-95 flex-shrink-0 whitespace-nowrap"
          >
            <span>เทียบเลย</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
