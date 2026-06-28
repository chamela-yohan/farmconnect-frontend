"use client";

import { useAuthStore } from "@/stores/authStore";
import { Home, ShoppingCart, MessageCircle, User, Sprout, Package, LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

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

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/login`);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background min-h-screen fixed left-0 top-14">
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
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

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}