"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocale } from "next-intl";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrate } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace(`/${locale}/login`);
    }
  }, [isAuthenticated, router, locale]);

  if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Main Content - Add left margin on desktop for sidebar */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0"> 
          {children}
        </main>
      </div>
      {/* Mobile Bottom Nav - Only show on mobile */}
      <BottomNav />
    </div>
  );
}