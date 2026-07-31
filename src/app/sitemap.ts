import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getProducts } from "@/lib/firebase/services/products";
import { getCategories } from "@/lib/firebase/services/categories";
import { getPosts } from "@/lib/firebase/services/posts";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/affiliate-disclosure`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    // Dynamic products, categories, posts
    const [products, categories, posts] = await Promise.all([
      getProducts({ status: "published", limitCount: 1000 }),
      getCategories("active"),
      getPosts({ status: "published", limitCount: 500 }),
    ]);

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${baseUrl}/categories/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...productUrls, ...categoryUrls, ...postUrls];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
