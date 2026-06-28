"use client";

import { useAuthStore } from "@/stores/authStore";
import { Home, ShoppingCart, MessageCircle, User, Sprout, Package } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const { user, isAuthenticated } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();

  // Don't show nav if not authenticated
  if (!isAuthenticated || !user) return null;

  // Define links based on role
  const buyerLinks = [
    { href: `/${locale}/dashboard/buyer`, label: t('home'), icon: Home },
    { href: `/${locale}/orders`, label: t('orders'), icon: ShoppingCart },
    { href: `/${locale}/chat`, label: t('chat'), icon: MessageCircle },
    { href: `/${locale}/profile`, label: t('profile'), icon: User },
  ];

  const farmerLinks = [
    { href: `/${locale}/dashboard/farmer`, label: t('dashboard'), icon: Home },
    { href: `/${locale}/products`, label: t('products'), icon: Package },
    { href: `/${locale}/orders`, label: t('orders'), icon: ShoppingCart },
    { href: `/${locale}/chat`, label: t('chat'), icon: MessageCircle },
  ];

  const links = user.role === 'FARMER' ? farmerLinks : buyerLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}