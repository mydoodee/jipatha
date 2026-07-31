import Link from "next/link";
import { ProductSerialized } from "@/types/product";
import { ProductImage } from "./ProductImage";
import { ProductPrice } from "./ProductPrice";
import { Star } from "lucide-react";
import { AffiliateButton } from "@/components/affiliate/AffiliateButton";

interface ProductCardProps {
  product: ProductSerialized;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0];

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image Link */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden">
        <ProductImage
          src={mainImage}
          alt={product.name}
          aspectRatio="square"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.featured && (
          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-orange-500/30">
            ⚡ แนะนำ
          </span>
        )}
        {product.discountPercent !== undefined && product.discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
            -{product.discountPercent}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Title */}
        <Link href={`/products/${product.slug}`} className="group-hover:text-orange-600 transition-colors">
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mb-1.5 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-2 mb-2 flex-grow hidden xs:block leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Rating */}
        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating!)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-500">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price & Action */}
        <div className="pt-2.5 border-t border-gray-50 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mt-auto">
          <ProductPrice
            price={product.price}
            originalPrice={product.originalPrice}
            discountPercent={product.discountPercent}
            size="sm"
          />
          <AffiliateButton
            slug={product.slug}
            size="sm"
            label="เช็คราคา"
            className="w-full xs:w-auto text-[11px] py-1.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}
