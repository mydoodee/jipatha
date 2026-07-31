"use client";

import { use, useEffect, useState } from "react";
import { getProductBySlug } from "@/lib/firebase/services/products";
import { getAffiliateLinkByProductId, incrementClickCount } from "@/lib/firebase/services/affiliateLinks";

interface GoRedirectClientProps {
  params: Promise<{ slug: string }>;
}

export default function GoRedirectClient({ params }: GoRedirectClientProps) {
  const { slug } = use(params);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function redirect() {
      if (!slug) return;
      try {
        const product = await getProductBySlug(slug);
        if (!product) {
          setError("ไม่พบสินค้าที่คุณกำลังค้นหา");
          return;
        }

        const affiliateLink = await getAffiliateLinkByProductId(product.id);
        const destinationUrl =
          affiliateLink?.affiliateUrl ||
          affiliateLink?.originalUrl ||
          (product as any).affiliateUrl;

        if (!destinationUrl) {
          window.location.href = `/products/${slug}`;
          return;
        }

        if (affiliateLink?.id) {
          incrementClickCount(affiliateLink.id).catch((err) =>
            console.error("Click tracking error:", err)
          );
        }

        window.location.href = destinationUrl;
      } catch (err) {
        console.error("Redirect error:", err);
        window.location.href = `/products/${slug}`;
      }
    }

    redirect();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-red-600 font-semibold">{error}</p>
          <a href="/products" className="text-orange-600 underline text-sm">
            ดูสินค้าทั้งหมด
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
      <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 text-sm font-medium">กำลังนำคุณไปยังหน้าสินค้าใน Shopee...</p>
    </div>
  );
}
