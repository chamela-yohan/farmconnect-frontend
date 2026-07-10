"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Leaf, ShoppingCart, LogOut, VeganIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Header() {
  const { user, logout } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations("nav");

  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          
          {/* 1. Logo / Brand (Using professional icon instead of emoji) */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <VeganIcon className="w-6 h-6" />
            <span className="hidden sm:inline">FarmConnect</span>
          </Link>

          {/* 2. Desktop & Mobile Actions */}
          <div className="flex items-center gap-1 sm:gap-4">
            
            {/* LANGUAGE & THEME: Scaled down on mobile to save space, full size on desktop */}
            <div className="scale-75 sm:scale-100 origin-right">
              <LanguageSwitcher />
            </div>
            <div className="scale-75 sm:scale-100 origin-center">
              <ThemeToggle />
            </div>

            {/* User Profile & Cart */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-3">
                
                {/* CART: Visible to ALL logged-in users (Buyers & Farmers) */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
                  aria-label="Open Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>

                <Link
                  href={`/${locale}/profile`}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  {/* Hide name on mobile to save space */}
                  <span className="hidden md:inline-block text-sm font-medium">
                    {user.name}
                  </span>
                </Link>

                {/* Hide logout button on mobile (they can logout from profile page) */}
                <button
                  onClick={logout}
                  className="hidden sm:block p-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}