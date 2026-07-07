"use client";

import { useTranslations } from 'next-intl';
import { ProductFormData, ProductType } from '@/types/product';
import Image from 'next/image';
import { ArrowLeft, Check } from 'lucide-react';

interface ProductReviewProps {
  formData: ProductFormData;
  images: File[];
  video: File | undefined;
  onBack: () => void;
  onSubmit: () => void;
}

export function ProductReview({ formData, images, video, onBack, onSubmit }: ProductReviewProps) {
  const t = useTranslations('products');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{t('review.title')}</h2>
        
        {/* Product Type */}
        <div>
          <p className="text-sm text-muted-foreground">{t('review.productType')}</p>
          <p className="font-medium text-foreground">
            {formData.productType === ProductType.PHYSICAL_GOOD && '🍎 Physical Good'}
            {formData.productType === ProductType.RENTABLE && '🔧 Rentable'}
            {formData.productType === ProductType.SERVICE && '👨‍🌾 Service'}
          </p>
        </div>

        {/* Title & Description */}
        <div>
          <p className="text-sm text-muted-foreground">{t('review.title')}</p>
          <p className="font-medium text-foreground">{formData.title}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{t('review.description')}</p>
          <p className="text-foreground">{formData.description}</p>
        </div>

        {/* Price */}
        <div>
          <p className="text-sm text-muted-foreground">{t('review.price')}</p>
          <p className="text-2xl font-bold text-primary">{formatPrice(formData.price)}</p>
        </div>

        {/* Type-Specific Info */}
        {formData.productType === ProductType.PHYSICAL_GOOD && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('review.stock')}</p>
              <p className="font-medium text-foreground">
                {formData.availableStock} {formData.unit}
              </p>
            </div>
          </div>
        )}

        {formData.productType === ProductType.RENTABLE && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('review.rentalPrice')}</p>
              <p className="font-medium text-foreground">
                {formatPrice(formData.rentalPricePerDay || 0)} / day
              </p>
            </div>
            {formData.depositAmount && (
              <div>
                <p className="text-sm text-muted-foreground">{t('review.deposit')}</p>
                <p className="font-medium text-foreground">{formatPrice(formData.depositAmount)}</p>
              </div>
            )}
          </div>
        )}

        {formData.productType === ProductType.SERVICE && (
          <div>
            <p className="text-sm text-muted-foreground">{t('review.duration')}</p>
            <p className="font-medium text-foreground">{formData.serviceDurationHours} hours</p>
          </div>
        )}

        {/* Delivery */}
        {formData.isDeliveryAvailable && (
          <div>
            <p className="text-sm text-muted-foreground">{t('review.delivery')}</p>
            <p className="font-medium text-foreground">
              Available {formData.deliveryFee ? `(${formatPrice(formData.deliveryFee)})` : ''}
            </p>
          </div>
        )}

        {/* Images */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">{t('review.images')}</p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {images.map((file, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Video */}
        {video && (
          <div>
            <p className="text-sm text-muted-foreground">{t('review.video')}</p>
            <p className="font-medium text-foreground">{video.name}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-12 border border-border rounded-lg font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('review.back')}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          {t('review.submit')}
        </button>
      </div>
    </div>
  );
}