import Link from "next/link";
import { getPosts } from "@/lib/firebase/services/posts";
import { Plus, Edit, ExternalLink, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminPostsPage() {
  const posts = await getPosts({ status: undefined, limitCount: 100 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการบทความ</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            รายการบทความทั้งหมด ({posts.length} บทความ)
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>เขียนบทความใหม่</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">ยังไม่มีบทความในระบบ</p>
            <p className="text-xs text-gray-400 mt-1">คลิกปุ่ม &quot;เขียนบทความใหม่&quot; ด้านบนเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">หัวข้อบทความ</th>
                  <th className="px-6 py-3">วันที่</th>
                  <th className="px-6 py-3">สถานะ</th>
                  <th className="px-6 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div>
                        <span className="block font-semibold line-clamp-1">{post.title}</span>
                        <span className="text-xs text-gray-400 font-mono">{post.slug}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          post.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {post.status === "published" ? "เผยแพร่" : "ฉบับร่าง"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 rounded"
                        title="ดูหน้าเว็บ"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="inline-flex items-center p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
