"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/api/store/auth.store";
import Navbar from "@/components/common/dashboard/Navbar";
import Sidebar from "@/components/common/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // If user is not onboarded, redirect to onboarding flow
    if (user && !user.hasOnboarded) {
      router.push("/onboarding");
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "100vh" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
