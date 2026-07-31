"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/firebase/auth";
import { ShoppingBag, Lock, Mail, AlertCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-md">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {siteConfig.name} Admin
          </h1>
          <p className="text-xs text-gray-500">
            เข้าสู่ระบบจัดการข้อมูลหลังบ้าน
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              อีเมล
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold text-sm rounded-lg shadow-xs transition-colors"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
