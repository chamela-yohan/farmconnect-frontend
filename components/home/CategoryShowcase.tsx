"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Apple, Carrot, Egg, Fish, Milk, Sprout, Wheat } from "lucide-react";
import { useProductCategories } from "@/lib/api/products";

const ICON_RULES = [
  { match: ["veg"], icon: Carrot },
  { match: ["fruit"], icon: Apple },
  { match: ["dairy", "milk"], icon: Milk },
  { match: ["grain", "rice", "paddy"], icon: Wheat },
  { match: ["fish", "seafood"], icon: Fish },
  { match: ["egg", "poultry"], icon: Egg },
];

type Category = {
  id: string;
  name: string;
  slug: string;
};

function iconFor(category: Category) {
  console.log(category, typeof category);

  const lower = category.name.toLowerCase();
  return ICON_RULES.find(rule =>
    rule.match.some(m => lower.includes(m))
  )?.icon ?? Sprout;
}

export function CategoryShowcase() {
  const locale = useLocale();
  const t = useTranslations("home");
  const { data: categories, isLoading, isError } = useProductCategories();

  if (isError) return null; // nice-to-have section — fail quietly rather than breaking the page

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
        {t("categoriesTitle")}
      </h2>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && categories?.length === 0 && (
        <p className="text-center text-muted-foreground text-sm">{t("categoriesEmpty")}</p>
      )}

      {!isLoading && categories && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = iconFor(category);
            return (
              <Link
                key={category.id}
                href={`/${locale}/products?category=${encodeURIComponent(category.id)}`}
                className="flex flex-col items-center justify-center gap-2 h-28 bg-card border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all text-center px-2"
              >
                <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                <span className="text-sm font-medium text-foreground line-clamp-1">{category.slug}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}