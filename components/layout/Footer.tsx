"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Mail, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCategories } from "@/lib/api/products";

export function Footer() {
  const locale = useLocale();
  const t = useTranslations("footer");
  const { data: categories = [] } = useCategories();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-3">
              <Logo className="w-8 h-8" />
              <span className="font-bold text-xl">
                <span className="text-foreground">Farm</span>
                <span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">{t("tagline")}</p>
            <LanguageSwitcher />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t("marketplaceHeading")}</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href={`/${locale}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("browse")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/farmer/dashboard`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("forFarmers")}
                </Link>
              </li>
            </ul>
          </div>

          {categories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">{t("categoriesHeading")}</h3>
              <ul className="space-y-2.5">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/${locale}/products?category=${category.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t("stayUpdatedHeading")}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t("stayUpdatedText")}</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="w-full h-10 pl-9 pr-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                aria-label={t("subscribe")}
                className="shrink-0 h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-muted-foreground">{t("madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}