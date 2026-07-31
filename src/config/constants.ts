// Pagination
export const PRODUCTS_PER_PAGE = 12;
export const POSTS_PER_PAGE = 9;
export const ADMIN_ITEMS_PER_PAGE = 20;

// Caching (seconds)
export const CACHE_REVALIDATE_DEFAULT = 3600; // 1 hour
export const CACHE_REVALIDATE_SITEMAP = 3600;

// Image
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

// Firebase Storage paths
export const STORAGE_PATHS = {
  products: "products",
  categories: "categories",
  posts: "posts",
  site: "site",
} as const;

// Affiliate
export const AFFILIATE_PLATFORMS = ["shopee"] as const;
export type AffiliatePlatform = (typeof AFFILIATE_PLATFORMS)[number];

// Status
export const PRODUCT_STATUSES = ["draft", "published"] as const;
export const CATEGORY_STATUSES = ["active", "inactive"] as const;
export const POST_STATUSES = ["draft", "published"] as const;
export const LINK_STATUSES = ["active", "inactive"] as const;
export const USER_ROLES = ["admin", "editor", "viewer"] as const;
export const USER_STATUSES = ["active", "inactive"] as const;

// Theme colors
export const THEME = {
  primary: "#EE4D2D",
  primaryDark: "#D73211",
  background: "#F5F5F5",
  white: "#FFFFFF",
  text: "#222222",
  muted: "#757575",
} as const;

// SEO
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
