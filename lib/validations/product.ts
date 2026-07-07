// lib/validations/product.ts
import { z } from 'zod';
import { ProductType } from '@/types/product';

export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  productType: z.nativeEnum(ProductType),
  
  // Common
  isDeliveryAvailable: z.boolean(),
  deliveryFee: z.coerce.number().min(0).optional(),
  
  // Physical Good Specific
  availableStock: z.coerce.number().min(0).optional(),
  unit: z.string().optional(),
  
  // Rental Specific
  rentalPricePerDay: z.coerce.number().positive().optional(),
  depositAmount: z.coerce.number().min(0).optional(),
  minRentalDays: z.coerce.number().min(1).optional(),
  maxRentalDays: z.coerce.number().min(1).optional(),
  
  // Service Specific
  serviceDurationHours: z.coerce.number().min(1).optional(),
}).refine((data) => {
  // Conditional Validation based on Product Type
  if (data.productType === ProductType.PHYSICAL_GOOD) {
    if (!data.availableStock || data.availableStock < 0) {
      return false;
    }
    if (!data.unit) {
      return false;
    }
  }
  
  if (data.productType === ProductType.RENTABLE) {
    if (!data.rentalPricePerDay || data.rentalPricePerDay <= 0) {
      return false;
    }
  }
  
  if (data.productType === ProductType.SERVICE) {
    if (!data.serviceDurationHours || data.serviceDurationHours < 1) {
      return false;
    }
  }
  
  return true;
}, {
  message: 'Please fill in all required fields for the selected product type',
});

export type ProductFormData = z.infer<typeof productSchema>;