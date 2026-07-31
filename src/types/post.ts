import { Timestamp } from "firebase/firestore";

export interface Post {
  id: string;
  title: string;
  slug: string;

  excerpt: string;
  content: string;

  featuredImage?: string;

  categoryId?: string;
  tags: string[];

  status: "draft" | "published";

  seoTitle?: string;
  seoDescription?: string;

  publishedAt?: Timestamp;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PostSerialized {
  id: string;
  title: string;
  slug: string;

  excerpt: string;
  content: string;

  featuredImage?: string;

  categoryId?: string;
  tags: string[];

  status: "draft" | "published";

  seoTitle?: string;
  seoDescription?: string;

  publishedAt?: string;

  createdAt: string;
  updatedAt: string;
}
