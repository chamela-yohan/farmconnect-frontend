'use client'

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FarmerDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

    useEffect(() => {
    if (user && user.role === "FARMER" && !user.isVerified) {
      router.push("/en/farmer/verification-pending");
    }
  }, [user, router]);

  const t = useTranslations("nav");

  return (
    <div className="container px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">{t("dashboard")}</h1>
      <p className="text-muted-foreground mt-2">
        Welcome to your farmer dashboard.
      </p>
    </div>
  );
}
