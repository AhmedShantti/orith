"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ApiResponse, User } from "@/types";
import Sidebar from "@/components/admin/Sidebar";
import { ToastProvider } from "@/components/admin/Toast";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("orith_token");
    if (!token) {
      router.push("/login");
      return;
    }

    api
      .get<ApiResponse<User>>("/api/auth/me")
      .then((res) => {
        if (res.success && res.data && res.data.role === "ADMIN") {
          setAdmin(res.data);
        } else {
          localStorage.removeItem("orith_token");
          router.push("/login");
        }
      })
      .catch(() => {
        localStorage.removeItem("orith_token");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("orith_token");
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
          <p className="text-white/30 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <ToastProvider>
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex">
        <Sidebar adminName={admin.name} onLogout={handleLogout} />
        <div className="ml-[240px] flex-1 overflow-y-auto">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
