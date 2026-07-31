import { Timestamp } from "firebase/firestore";

export interface AffiliateLink {
  id: string;
  productId: string;

  platform: "shopee";

  originalUrl: string;
  affiliateUrl: string;

  status: "active" | "inactive";

  clickCount: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AffiliateLinkSerialized {
  id: string;
  productId: string;

  platform: "shopee";

  originalUrl: string;
  affiliateUrl: string;

  status: "active" | "inactive";

  clickCount: number;

  createdAt: string;
  updatedAt: string;
}
