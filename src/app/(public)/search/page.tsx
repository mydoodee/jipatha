import { Suspense } from "react";
import { SearchClient } from "./SearchClient";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { constructMetadata } from "@/lib/seo/metadata";
import { Loader2 } from "lucide-react";

export const dynamic = "force-static";

export const metadata = constructMetadata({
  title: "ค้นหาสินค้าและบทความ",
  description: "ค้นหาสินค้าคุณภาพ เปรียบเทียบราคา และอ่านบทความรีวิว",
  path: "/search",
  noIndex: true,
});

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: "ค้นหา" }]} />
      <Suspense
        fallback={
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center my-6 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">กำลังโหลด...</p>
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </div>
  );
}
