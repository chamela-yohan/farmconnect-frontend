"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ShieldCheck, Sprout, Truck } from "lucide-react";
import { HeroIllustration } from "./HeroIllustration";

export function HeroSection() {
  const locale = useLocale();
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden bg-muted/30 border-b border-border">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              {t("heroEyebrow")}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              {t("heroTitle")}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link
                href={`/${locale}/search`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                {t("heroCtaBrowse")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/${locale}/register`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                {t("heroCtaSell")}
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                {t("trustVerified")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sprout className="w-4 h-4 text-primary shrink-0" />
                {t("trustFresh")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                {t("trustDirect")}
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-border">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
