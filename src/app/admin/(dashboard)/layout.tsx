import { AuthProvider } from "@/components/admin/AuthProvider";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex min-h-screen bg-gray-100 font-sans">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader />
            <main className="p-6 flex-grow">{children}</main>
          </div>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
