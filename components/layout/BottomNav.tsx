"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Home, ShoppingCart, MessageCircle, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LoginModal } from "@/components/auth/LoginModal";

export function BottomNav() {
  const { user } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | undefined>();

  const links = [
    { href: `/${locale}/dashboard/buyer`, label: t('home'), icon: Home, protected: true },
    { href: `/${locale}/orders`, label: t('orders'), icon: ShoppingCart, protected: true },
    { href: `/${locale}/chat`, label: t('chat'), icon: MessageCircle, protected: true },
    { href: `/${locale}/profile`, label: t('profile'), icon: User, protected: true },
  ];

  const handleLinkClick = (href: string, isProtected: boolean) => {
    if (isProtected && !user) {
      setPendingRoute(href);
      setLoginModalOpen(true);
      return false;
    }
    return true;
  };

  //  Always render - no conditional rendering
  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex justify-around items-center h-16">
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
                className={`flex flex-col items-center gap-1 px-3 py-2 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

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