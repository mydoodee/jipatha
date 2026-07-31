"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import app from "@/lib/firebase/client";
import { createUserProfile } from "@/lib/firebase/services/users";
import { ShoppingBag, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function AdminSetupPage() {
  const [email, setEmail] = useState("admingrowkub@gmail.com");
  const [password, setPassword] = useState("Kub@789/*");
  const [displayName, setDisplayName] = useState("Admin Jipatha");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const auth = getAuth(app);
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Create Firestore user profile with admin role
      await createUserProfile(
        userCredential.user.uid,
        email,
        displayName,
        "admin"
      );

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (err: unknown) {
      console.error("Setup error:", err);
      if (err instanceof Error) {
        if (err.message.includes("email-already-in-use")) {
          setError("อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบที่หน้า Login");
        } else if (err.message.includes("weak-password")) {
          setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        } else if (err.message.includes("invalid-api-key")) {
          setError(
            "Firebase API Key ยังไม่ได้ตั้งค่า กรุณาเพิ่ม Firebase credentials ในไฟล์ .env.local ก่อน"
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน");
      }
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
            {siteConfig.name}
          </h1>
          <p className="text-xs text-gray-500">
            ตั้งค่าผู้ดูแลระบบคนแรก (One-Time Admin Setup)
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg flex flex-col items-center gap-2 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <p className="font-bold text-sm">สร้างบัญชี Admin สำเร็จแล้ว!</p>
            <p className="text-xs text-emerald-600">
              กำลังนำคุณไปยังหน้า Dashboard...
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg">
              <p className="font-bold mb-1">⚠️ ข้อกำหนดก่อนใช้งาน:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>
                  ต้องตั้งค่า Firebase credentials ในไฟล์{" "}
                  <code className="bg-amber-100 px-1 rounded">.env.local</code>{" "}
                  ก่อน
                </li>
                <li>
                  ต้องเปิดใช้งาน Email/Password Authentication ใน Firebase
                  Console
                </li>
                <li>ต้องสร้าง Firestore Database ใน Firebase Console</li>
              </ol>
            </div>

            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ชื่อผู้ดูแลระบบ
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  อีเมล (ใช้เข้าสู่ระบบ)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {loading
                    ? "กำลังสร้างบัญชี..."
                    : "สร้างบัญชี Admin คนแรก"}
                </span>
              </button>
            </form>
          </>
        )}

        <p className="text-[10px] text-center text-gray-400">
          หน้านี้ควรใช้ครั้งเดียวเท่านั้น หลังจากสร้างบัญชีแล้วควรลบไฟล์นี้ออกจากโปรเจค
        </p>
      </div>
    </div>
  );
}
