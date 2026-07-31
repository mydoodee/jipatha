import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/go/", "/search"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
