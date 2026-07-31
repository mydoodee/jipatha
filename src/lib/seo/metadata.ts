import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}

export function constructMetadata({
  title,
  description = siteConfig.description,
  image = "/logo.png",
  path = "",
  noIndex = false,
  type = "website",
}: GenerateMetadataOptions = {}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const canonicalUrl = `${siteConfig.url}${path}`;
  const imageUrl = image.startsWith("http") ? image : `${siteConfig.url}${image}`;

  return {
    title: metaTitle,
    description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/logo.png",
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
      locale: siteConfig.locale,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
  };
}
