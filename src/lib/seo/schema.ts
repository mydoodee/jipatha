import { siteConfig } from "@/config/site";
import { ProductSerialized } from "@/types/product";
import { PostSerialized } from "@/types/post";

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
  };
}

export function generateProductSchema(product: ProductSerialized) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.shortDescription || product.description,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/products/${product.slug}`,
      priceCurrency: "THB",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Shopee",
      },
    },
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: 1,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function generateArticleSchema(post: PostSerialized) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage ? [post.featuredImage] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; item: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item.startsWith("http")
        ? item.item
        : `${siteConfig.url}${item.item}`,
    })),
  };
}
