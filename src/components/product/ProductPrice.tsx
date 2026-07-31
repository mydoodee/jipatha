import { formatPrice, calculateDiscount } from "@/lib/utils";

interface ProductPriceProps {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  size?: "sm" | "md" | "lg";
}

export function ProductPrice({
  price,
  originalPrice,
  discountPercent,
  size = "md",
}: ProductPriceProps) {
  const calculatedDiscount =
    discountPercent || (originalPrice ? calculateDiscount(originalPrice, price) : 0);

  const priceSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl font-bold",
  }[size];

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`font-bold text-orange-600 ${priceSizes}`}>
        {formatPrice(price)}
      </span>

      {originalPrice && originalPrice > price && (
        <span className="text-xs sm:text-sm text-gray-400 line-through">
          {formatPrice(originalPrice)}
        </span>
      )}

      {calculatedDiscount > 0 && (
        <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.5 rounded">
          -{calculatedDiscount}%
        </span>
      )}
    </div>
  );
}
