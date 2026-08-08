"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Sprout } from "lucide-react";
import { useCategories } from "@/lib/api/products";

export function CategoryShowcase() {
  const locale = useLocale();
  const t = useTranslations("home");
  const { data: categories, isLoading, isError } = useCategories();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (isError) return null;

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{t("categoriesTitle")}</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 w-36 sm:w-40 shrink-0 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && categories?.length === 0 && (
        <p className="text-center text-muted-foreground text-sm">{t("categoriesEmpty")}</p>
      )}

      {!isLoading && categories && categories.length > 0 && (
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${locale}/products?category=${category.slug}`}
              className="snap-start shrink-0 w-36 sm:w-40 flex flex-col items-center justify-center gap-3 h-32 bg-card border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all text-center px-3"
            >
              {category.iconUrl ? (
                <img src={category.iconUrl} alt="" className="w-8 h-8" loading="lazy" />
              ) : (
                <Sprout className="w-7 h-7 text-primary" strokeWidth={1.5} />
              )}
              <span className="text-sm font-medium text-foreground line-clamp-1">{category.name}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}