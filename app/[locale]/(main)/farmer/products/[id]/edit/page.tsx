"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import {
  useProduct,
  useUpdateProduct,
  buildProductAttributes,
} from "@/lib/api/products";
import { ProductFormData, ProductType } from "@/types/product";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductReview } from "@/components/products/ProductReview";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function EditProductPage() {
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { user, isHydrated } = useAuthStore();
  const {
    data: product,
    isLoading: isLoadingProduct,
    isError,
  } = useProduct(productId);
  const updateMutation = useUpdateProduct(productId);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | undefined>();
  const [existingImages, setExistingImages] = useState<
    { id: string; url: string }[]
  >([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [removeVideo, setRemoveVideo] = useState(false);

  useEffect(() => {
    if (isHydrated && user && user.role !== "FARMER") {
      router.push(`/${locale}`);
    }
  }, [isHydrated, user, locale, router]);

  useEffect(() => {
    if (!product) return;
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      productType: product.productType,
      categoryId: product.categoryId,
      isDeliveryAvailable: product.isDeliveryAvailable,
      deliveryFee: product.deliveryFee,
      minOrderQty: product.minOrderQty,
      maxOrderQty: product.maxOrderQty,
      qtyStep: product.qtyStep,
      locationCityIds: product.locations?.map((loc) => loc.cityId) || [],
      deliveryDistrictIds: product.deliveryDistrictIds,
      availableStock:
        product.productType === ProductType.PHYSICAL_GOOD
          ? product.attributes?.availableStock
          : product.attributes?.availableUnits,
      unit: product.attributes?.unit,
      rentalPricePerDay: product.attributes?.rentalPricePerDay,
      depositAmount: product.attributes?.depositAmount,
      minRental: product.attributes?.minRental,
      maxRental: product.attributes?.maxRental,
      availableUnits: product.attributes?.availableUnits,
      expiryDate: product.attributes?.expiryDate,
    });
    setExistingImages(
      (product.imageDetails || []).map((img) => ({ id: img.id, url: img.url })),
    );
    setExistingVideoUrl(product.videoUrl || null);
  }, [product]);

  const initialLocationNames = useMemo(() => {
    if (!product?.locations) return {};
    const names: Record<number, string> = {};
    product.locations.forEach((loc) => {
      names[loc.cityId] = loc.cityName;
    });
    return names;
  }, [product]);

  const handleRemoveExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);
  };

  const handleRemoveExistingVideo = () => {
    setExistingVideoUrl(null);
    setRemoveVideo(true);
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setErrorMessage(null);
    console.log("removedImageIds at submit:", removedImageIds);
    try {
      await updateMutation.mutateAsync({
        product: {
          title: formData.title.trim(),
          description: formData.description.trim(),
          productType: formData.productType,
          price: Number(formData.price),
          categoryId: formData.categoryId,
          minOrderQty: formData.minOrderQty
            ? Number(formData.minOrderQty)
            : undefined,
          maxOrderQty: formData.maxOrderQty
            ? Number(formData.maxOrderQty)
            : undefined,
          qtyStep: formData.qtyStep ? Number(formData.qtyStep) : undefined,
          isDeliveryAvailable: Boolean(formData.isDeliveryAvailable),
          deliveryFee: formData.deliveryFee
            ? Number(formData.deliveryFee)
            : undefined,
          locationCityIds: formData.locationCityIds || [],
          deliveryDistrictIds: formData.deliveryDistrictIds || [],
          attributes: buildProductAttributes(formData),
        },
        newImages: images,
        removedImageIds,
        video,
        removeVideo,
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to update product. Please try again.",
      );
    }
  };

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
          You need to be logged in as a farmer to edit this product.
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

  if (user.role !== "FARMER" || isLoadingProduct || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Product not found
        </h1>
        <p className="text-muted-foreground">
          It may have been removed, or you don't have access to it.
        </p>
      </div>
    );
  }

  return (
    <>
      {errorMessage && (
        <ErrorAlert
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

        {currentStep === 1 && (
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            images={images}
            setImages={setImages}
            video={video}
            setVideo={setVideo}
            onNext={() => setCurrentStep(2)}
            existingImages={existingImages}
            onRemoveExistingImage={handleRemoveExistingImage}
            existingVideoUrl={existingVideoUrl}
            onRemoveExistingVideo={handleRemoveExistingVideo}
            initialLocationNames={initialLocationNames}
          />
        )}

        {currentStep === 2 && (
          <ProductReview
            formData={formData}
            images={images}
            video={video}
            onBack={() => setCurrentStep(1)}
            onSubmit={handleSubmit}
            existingImages={existingImages}
            existingVideoUrl={existingVideoUrl}
            isSubmitting={updateMutation.isPending}
          />
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        message="Product updated successfully!"
        onClose={() => {
          setShowSuccessModal(false);
          router.push(`/${locale}/farmer/products`);
        }}
      />
    </>
  );
}
