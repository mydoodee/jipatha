import { siteConfig } from "@/config/site";
import { Info } from "lucide-react";

interface AffiliateDisclosureProps {
  className?: string;
  variant?: "banner" | "simple";
}

export function AffiliateDisclosure({
  className = "",
  variant = "banner",
}: AffiliateDisclosureProps) {
  if (variant === "simple") {
    return (
      <p className={`text-xs text-gray-500 flex items-center gap-1 ${className}`}>
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{siteConfig.affiliateDisclosure}</span>
      </p>
    );
  }

  return (
    <div
      className={`bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800 flex items-start gap-2.5 ${className}`}
    >
      <Info className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-orange-900 mb-0.5">การเปิดเผยข้อความ Affiliate</p>
        <p className="text-orange-700 leading-relaxed">{siteConfig.affiliateDisclosure}</p>
      </div>
    </div>
  );
}
