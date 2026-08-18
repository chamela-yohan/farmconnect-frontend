"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LayoutDashboard, Package, ShoppingBag, Menu, X } from "lucide-react";

export function FarmerSidebar() {
  const locale = useLocale();
  const t = useTranslations("farmerNav");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/farmer/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/farmer/products", label: t("myProducts"), icon: Package },
    { href: "/farmer/orders", label: t("orders"), icon: ShoppingBag }, // ⚠️ confirm this is the real path — haven't touched this page this session
  ];

  const isActive = (href: string) => pathname.startsWith(`/${locale}${href}`);

  const linkClasses = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <>
      {/* Mobile trigger — sits right below the sticky Navbar */}
      <div className="lg:hidden sticky top-16 z-20 flex items-center gap-2 border-b border-border bg-background px-4 py-3">
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Menu className="w-5 h-5" />
          {t("menuTrigger")}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer on mobile, static column on desktop — same interaction pattern as the search filters drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto
          bg-card border-r border-border p-4
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:z-auto lg:translate-x-0 lg:transition-none lg:shrink-0
        `}
      >
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <span className="font-semibold text-foreground">{t("menuTrigger")}</span>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden lg:block mb-6 px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("workspaceLabel")}
          </h2>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                onClick={() => setIsOpen(false)}
                className={linkClasses(isActive(item.href))}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}