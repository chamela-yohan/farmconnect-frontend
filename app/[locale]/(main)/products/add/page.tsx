"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { useCreateProduct, prepareProductFormData } from "@/lib/api/products";
import { ProductType, ProductFormData } from "@/types/product";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductReview } from "@/components/products/ProductReview";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { ErrorAlert } from "@/components/ui/ErrorAlert";

export default function AddProductPage() {
  const locale = useLocale();
  const t = useTranslations("products");
  const router = useRouter();

  const pathname = usePathname();
  const { user, isHydrated } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: 0,
    productType: ProductType.PHYSICAL_GOOD,
    isDeliveryAvailable: false,
    availableStock: undefined,
    unit: undefined,
    rentalPricePerDay: undefined,
    depositAmount: undefined,
    minRental: undefined,
    maxRental: undefined,
    deliveryFee: undefined,
  });

  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | undefined>();

  const createMutation = useCreateProduct();

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Authentication Required
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          You need to be logged in as a farmer to add new products to your
          inventory.
        </p>
        <Link
          href={`/${locale}/login`}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors shadow-lg"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    try {
      const formDataPayload = prepareProductFormData(formData, images, video);
      await createMutation.mutateAsync(formDataPayload);
      setShowSuccessModal(true);
    } catch (error: any) {
      // Extract the actual backend error message
      const backendMessage = error?.response?.data?.message;

      // Fallback messages based on error type
      const displayMessage =
        backendMessage ||
        (error?.message === "Network Error"
          ? "Network connection failed. Please check your internet."
          : "Failed to create product. Please try again.");

      setErrorMessage(displayMessage);
      console.error("Failed to create product:", error);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push(`/${locale}/products`);
  };

  if (createMutation.isPending) {
    return (
      <div className="container px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Show Error Alert if there is an error */}
      {errorMessage && (
        <ErrorAlert
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t("add.title")}</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium">{t("add.step1")}</span>
            </div>
            <div
              className={`w-16 h-0.5 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`}
            />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">{t("add.step2")}</span>
            </div>
          </div>
        </div>

        {/* Form Steps */}
        {currentStep === 1 && (
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            images={images}
            setImages={setImages}
            video={video}
            setVideo={setVideo}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <ProductReview
            formData={formData}
            images={images}
            video={video}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        message={t("add.successMessage")}
        onClose={handleModalClose}
      />
    </>
  );
}
