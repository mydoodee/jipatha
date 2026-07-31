"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "editor" | "viewer")[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/admin/login");
      } else if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        router.push("/admin/dashboard");
      }
    }
  }, [user, profile, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
