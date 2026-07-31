"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  initialQuery?: string;
}

export function SearchBar({
  placeholder = "ค้นหาสินค้า บทความ หมวดหมู่...",
  className = "",
  initialQuery = "",
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const currentQ = searchParams.get("q") || initialQuery;
  const [query, setQuery] = useState(currentQ);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
      />
      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-gray-400 hover:text-gray-600 absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
