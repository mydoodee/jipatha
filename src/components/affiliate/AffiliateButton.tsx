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
  label = "เช็คราคา",
  className = "",
  variant = "primary",
  size = "md",
}: AffiliateButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-1.5 font-bold rounded-full transition-all duration-200 shadow-md focus:outline-none active:scale-[0.98]";

  const variantStyles = {
    primary:
      "text-white shadow-rose-500/25 hover:shadow-lg hover:brightness-105",
    secondary:
      "bg-gray-900 hover:bg-black text-white focus:ring-gray-800",
    outline:
      "bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 focus:ring-orange-500",
  }[variant];

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base w-full sm:w-auto",
  }[size];

  return (
    <Link
      href={`/go/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      style={
        variant === "primary"
          ? { background: "linear-gradient(90deg, #ff5722 0%, #ff1744 100%)" }
          : undefined
      }
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
    >
      <ShoppingCart className="w-4 h-4" />
      <span>{label}</span>
      <ExternalLink className="w-3.5 h-3.5 opacity-90 ml-0.5" />
    </Link>
  );
}
