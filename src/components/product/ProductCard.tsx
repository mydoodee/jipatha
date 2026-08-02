"use client";

import Link from "next/link";
import { ProductSerialized } from "@/types/product";
import { ProductImage } from "./ProductImage";
import { ProductPrice } from "./ProductPrice";
import { Star, Scale } from "lucide-react";
import { AffiliateButton } from "@/components/affiliate/AffiliateButton";
import { useCompare } from "@/context/CompareContext";

interface ProductCardProps {
  product: ProductSerialized;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0];
  const { addToCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(product.id);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
      {/* Image Link & Compare Button Overlay */}
      <div className="relative overflow-hidden block">
        <Link href={`/products/${product.slug}`} className="block">
          <ProductImage
            src={mainImage}
            alt={product.name}
            aspectRatio="square"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Featured Badge */}
        {product.featured && (
          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-orange-500/30 pointer-events-none">
            ⚡ แนะนำ
          </span>
        )}

        {/* Discount Badge */}
        {product.discountPercent !== undefined && product.discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md pointer-events-none">
            -{product.discountPercent}%
          </span>
        )}
      </div>

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

        {/* Price Row & Explicit "+ เทียบราคา" Button */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 mb-2">
          <ProductPrice
            price={product.price}
            originalPrice={product.originalPrice}
            discountPercent={product.discountPercent}
            size="sm"
          />

          {/* Prominent Compare Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCompare(product);
            }}
            disabled={inCompare}
            className={`text-[11px] font-extrabold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 flex-shrink-0 ${
              inCompare
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default"
                : "bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 hover:border-orange-300 shadow-2xs hover:scale-105"
            }`}
            title="เปรียบเทียบสเปคกล้องรุ่นนี้"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{inCompare ? "เทียบแล้ว" : "+ เทียบราคา"}</span>
          </button>
        </div>

        {/* Exact Original Shopee Button Style (#ff5722 to #ff1744, rounded-full capsule) */}
        <AffiliateButton
          slug={product.slug}
          size="sm"
          label="เช็คราคา"
          className="w-full text-xs font-bold py-2 mt-auto"
        />
      </div>
    </div>
  );
}
