"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Home, ShoppingCart, MessageCircle, User, Sprout, Package, LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LoginModal } from "@/components/auth/LoginModal";

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | undefined>();

  //  Always show these links regardless of auth state
  const buyerLinks = [
    { href: `/${locale}/dashboard/buyer`, label: t('home'), icon: Home, protected: true },
    { href: `/${locale}/orders`, label: t('orders'), icon: ShoppingCart, protected: true },
    { href: `/${locale}/chat`, label: t('chat'), icon: MessageCircle, protected: true },
    { href: `/${locale}/profile`, label: t('profile'), icon: User, protected: true },
  ];

  const farmerLinks = [
    { href: `/${locale}/dashboard/farmer`, label: t('dashboard'), icon: Home, protected: true },
    { href: `/${locale}/products`, label: t('products'), icon: Package, protected: true },
    { href: `/${locale}/orders`, label: t('orders'), icon: ShoppingCart, protected: true },
    { href: `/${locale}/chat`, label: t('chat'), icon: MessageCircle, protected: true },
    { href: `/${locale}/profile`, label: t('profile'), icon: User, protected: true },
  ];

  //  Default to buyer links if no user, or use user's role
  const links = user?.role === 'FARMER' ? farmerLinks : buyerLinks;

  const handleLinkClick = (href: string, isProtected: boolean) => {
    //  If protected AND not logged in, show modal
    if (isProtected && !user) {
      setPendingRoute(href);
      setLoginModalOpen(true);
      return false; // Prevent navigation
    }
    return true; // Allow navigation
  };

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/login`);
  };

  // Always render sidebar - no conditional rendering
  return (
    <>
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background min-h-screen fixed left-0 top-14">
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (!handleLinkClick(link.href, link.protected)) {
                    e.preventDefault();
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Show logout only if logged in */}
        {user && (
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => {
          setLoginModalOpen(false);
          setPendingRoute(undefined);
        }}
        onLoginSuccess={() => {
          setLoginModalOpen(false);
          if (pendingRoute) {
            router.push(pendingRoute);
            setPendingRoute(undefined);
          }
        }}
      />
    </>
  );
}