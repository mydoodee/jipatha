import { Timestamp } from "firebase/firestore";

export interface CctvSpecs {
  resolution?: string; // e.g. "2K 3MP", "4K 8MP", "1080P Full HD"
  nightVision?: string; // e.g. "Full Color Night Vision", "Infrared 30m"
  connectivity?: string; // e.g. "Wi-Fi 2.4G/5G", "4G SIM Card", "LAN Cable"
  powerSupply?: string; // e.g. "Solar Cell 5W", "DC 12V Plug", "Battery"
  environment?: "indoor" | "outdoor" | "both";
  waterproof?: boolean;
  aiFeatures?: string[]; // e.g. ["Human Tracking", "Motion Alarm", "Two-way Audio", "Siren Alarm"]
  viewAngle?: string; // e.g. "360° Pan/Tilt", "110° Wide Angle"
  storage?: string; // e.g. "MicroSD / Cloud / NVR"
}

export interface Product extends CctvSpecs {
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
export interface ProductSerialized extends CctvSpecs {
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
