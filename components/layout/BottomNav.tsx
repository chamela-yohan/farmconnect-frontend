"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Home, ShoppingCart, MessageCircle, User, Package } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LoginModal } from "@/components/auth/LoginModal";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function BottomNav() {
  const { user } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | undefined>();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Dynamic Home link based on role
  const homeLink = user?.role === "FARMER" 
    ? { href: `/${locale}/dashboard/farmer`, label: t("dashboard") || "Dashboard", icon: Home, protected: true }
    : { href: `/${locale}/dashboard/buyer`, label: t("home"), icon: Home, protected: true };

  const links = [
    homeLink,
    { href: `/${locale}/orders`, label: t("orders"), icon: Package, protected: true }, // Changed to Package
    { href: `/${locale}/chat`, label: t("chat"), icon: MessageCircle, protected: true },
    { href: `/${locale}/profile`, label: t("profile"), icon: User, protected: true },
  ];

  const handleLinkClick = (href: string, isProtected: boolean) => {
    if (isProtected && !user) {
      setPendingRoute(href);
      setLoginModalOpen(true);
      return false;
    }
    return true;
  };

  const handleCartClick = () => {
    if (!user) {
      setPendingRoute("/cart");
      setLoginModalOpen(true);
      return;
    }
    setIsCartOpen(true);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
        {/* Use flex without justify-around, let flex-1 handle the spacing perfectly */}
        <div className="flex h-16">
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
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}

          {/* CART BUTTON: Perfectly sized using flex-1 */}
          <button
            onClick={handleCartClick}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Open Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t("cart") || "Cart"}</span>
          </button>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

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