import Link from "next/link";
import { ExternalLink, ShoppingCart } from "lucide-react";

interface AffiliateButtonProps {
  slug: string;
  label?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export function AffiliateButton({
  slug,
  label = "ดูสินค้าใน Shopee",
  className = "",
  variant = "primary",
  size = "md",
}: AffiliateButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]";

  const variantStyles = {
    primary:
      "bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500 hover:shadow-md",
    secondary:
      "bg-gray-900 hover:bg-black text-white focus:ring-gray-800",
    outline:
      "bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 focus:ring-orange-500",
  }[variant];

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base w-full sm:w-auto",
  }[size];

  return (
    <Link
      href={`/go/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
    >
      <ShoppingCart className="w-4 h-4" />
      <span>{label}</span>
      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
    </Link>
  );
}
