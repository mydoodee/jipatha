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
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Image Link */}
      <Link href={`/products/${product.slug}`} className="block relative">
        <ProductImage
          src={mainImage}
          alt={product.name}
          aspectRatio="square"
        />
        {product.featured && (
          <span className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            แนะนำ
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-grow">
        {/* Title */}
        <Link href={`/products/${product.slug}`} className="group-hover:text-orange-600 transition-colors">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 mb-1 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mb-2 flex-grow hidden xs:block">
          {product.shortDescription}
        </p>

        {/* Rating */}
        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-700">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price & Action */}
        <div className="pt-2 border-t border-gray-100 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 mt-auto">
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
            className="w-full xs:w-auto text-[11px] py-1 px-2.5"
          />
        </div>
      </div>
    </div>
  );
}
