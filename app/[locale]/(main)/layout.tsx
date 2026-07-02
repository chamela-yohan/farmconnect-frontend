"use client";

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        {/* Always reserve space for sidebar on desktop */}
        <main className="flex-1 md:ml-64">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}