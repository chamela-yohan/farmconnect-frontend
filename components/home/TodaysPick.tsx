"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { useFreshListings } from "@/lib/api/products";

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function TodaysPick() {
  const locale = useLocale();
  const t = useTranslations("home");
  const { data, isLoading, isError } = useFreshListings();
  const products = data?.content ?? [];

  if (isError || (!isLoading && products.length === 0)) return null;

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 pb-12 sm:pb-16">
        <div className="h-64 bg-muted/40 rounded-2xl animate-pulse" />
      </section>
    );
  }

  const pick = products[dayOfYear(new Date()) % products.length];
  const image = pick.imageUrls?.[0];

  return (
    <section className="container mx-auto px-4 pb-12 sm:pb-16">
      <div className="rounded-2xl border border-border bg-card overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto bg-muted">
          {image ? (
            <img src={image} alt={pick.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Sparkles className="w-10 h-10 opacity-30" />
            </div>
          )}
          <span className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground bg-primary px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            {t("todaysPickBadge")}
          </span>
        </div>
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">{pick.title}</h3>
          <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
            {pick.description || t("todaysPickFallbackDescription")}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">LKR {Number(pick.price).toLocaleString()}</span>
            <Link
              href={`/${locale}/products/${pick.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              {t("todaysPickCta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}