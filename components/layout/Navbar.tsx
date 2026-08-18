"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { Leaf, ShoppingCart, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Logo } from "./Logo";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/search`, label: t("browse") },
    { href: `/${locale}/farmer/dashboard`, label: t("forFarmers") },
  ];

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 shrink-0"
          >
            <Logo />
            <span className="hidden sm:inline font-bold text-xl">
              <span className="text-foreground">Farm</span>
              <span className="text-primary">Connect</span>
            </span>
          </Link>

          {/* Center nav — this is the space that was going empty */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side utilities */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <div className="hidden sm:block scale-90 origin-right">
              <LanguageSwitcher />
            </div>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
              aria-label={t("cart")}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>

            {user ? (
              <>
                <Link
                  href={`/${locale}/profile`}
                  className="hidden sm:flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="hidden sm:block p-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="hidden sm:inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t("login")}
              </Link>
            )}

            {/* Hamburger — same lg breakpoint as the center nav, so nothing ever shows twice */}
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {!user && (
              <Link
                href={`/${locale}/login`}
                onClick={() => setIsMenuOpen(false)}
                className="block text-center mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
              >
                {t("login")}
              </Link>
            )}
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
