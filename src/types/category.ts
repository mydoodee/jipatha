import { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;

  seoTitle?: string;
  seoDescription?: string;

  status: "active" | "inactive";

  sortOrder: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CategorySerialized {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;

  seoTitle?: string;
  seoDescription?: string;

  status: "active" | "inactive";

  sortOrder: number;

  createdAt: string;
  updatedAt: string;
}
