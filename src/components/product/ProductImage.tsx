"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  className = "",
  aspectRatio = "square",
  priority = false,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio];

  if (!src || error) {
    return (
      <div
        className={`bg-gray-100 flex flex-col items-center justify-center text-gray-400 p-4 ${aspectClasses} ${className}`}
      >
        <ImageOff className="w-8 h-8 mb-1 text-gray-300" />
        <span className="text-xs text-gray-400">ไม่มีรูปภาพ</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${aspectClasses} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
        onError={() => setError(true)}
      />
    </div>
  );
}
