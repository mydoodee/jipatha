import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  slug: string;

  shortDescription: string;
  description: string;

  images: string[];

  price: number;
  originalPrice?: number;
  discountPercent?: number;

  rating?: number;

  categoryId: string;
  tags: string[];

  platform: "shopee";

  affiliateLinkId: string;
  affiliateUrl?: string;

  status: "draft" | "published";

  featured: boolean;

  seoTitle?: string;
  seoDescription?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Serialized version for client components (Timestamps become strings)
export interface ProductSerialized {
  id: string;
  name: string;
  slug: string;

  shortDescription: string;
  description: string;

  images: string[];

  price: number;
  originalPrice?: number;
  discountPercent?: number;

  rating?: number;

  categoryId: string;
  tags: string[];

  platform: "shopee";

  affiliateLinkId: string;
  affiliateUrl?: string;

  status: "draft" | "published";

  featured: boolean;

  seoTitle?: string;
  seoDescription?: string;

  createdAt: string;
  updatedAt: string;
}
