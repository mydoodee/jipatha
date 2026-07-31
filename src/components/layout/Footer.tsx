import Link from "next/link";
import { footerNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { ShoppingBag } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-base text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt={siteConfig.name}
                className="w-7 h-7 object-cover rounded-lg"
              />
              <span className="text-white font-extrabold">{siteConfig.name}</span>
            </Link>
            <span className="hidden sm:inline text-gray-600">|</span>
            <p className="text-xs text-gray-400">
              {siteConfig.description}
            </p>
          </div>

          {/* Links */}
          <ul className="flex items-center gap-4 text-xs">
            {footerNavigation.legal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800/60 pt-3 mt-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. สงวนลิขสิทธิ์ทั้งหมด
          </p>
          <p className="text-gray-500">
            เว็บไซต์รีวิวสินค้าเปรียบเทียบราคา Shopee Affiliate
          </p>
        </div>
      </div>
    </footer>
  );
}
