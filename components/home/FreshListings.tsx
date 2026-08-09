"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useFreshListings } from "@/lib/api/products";
import { ProductCard } from "@/components/products/ProductCard";

export function FreshListings() {
  const locale = useLocale();
  const t = useTranslations("home");
  const { data, isLoading, isError } = useFreshListings();
  const products = data?.content ?? [];

  if (isError) return null;

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{t("freshListingsTitle")}</h2>
        <Link
          href={`/${locale}/products`}
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
        >
          {t("freshListingsViewAll")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">{t("freshListingsEmpty")}</p>
      )}

      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="sm:hidden mt-6 text-center">
        <Link href={`/${locale}/products`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
          {t("freshListingsViewAll")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}