"use client";

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useFarmerProducts, useDeleteProduct } from '@/lib/api/products';
import { ProductCard } from '@/components/products/ProductCard';
import { Plus, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SuccessModal } from '@/components/ui/SuccessModal';

export default function MyProductsPage() {
  const t = useTranslations('products');
  const locale = useLocale();
  const [page, setPage] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { data: products, isLoading, error } = useFarmerProducts(page, 12);
  const deleteMutation = useDeleteProduct();

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(productId);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8">
        <div className="text-center text-destructive">
          Failed to load products. Please try again.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('myProducts.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {products?.totalElements || 0} {t('myProducts.totalProducts')}
            </p>
          </div>
          
          <Link
            href={`/${locale}/products/add`}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('myProducts.addProduct')}
          </Link>
        </div>

        {/* Products Grid */}
        {products && products.content.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.content.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showActions={true}
                  onDelete={() => handleDelete(product.id, product.title)}
                />
              ))}
            </div>

            {/* Pagination */}
            {products.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page + 1} of {products.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(products.totalPages - 1, page + 1))}
                  disabled={page >= products.totalPages - 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {t('myProducts.noProducts')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('myProducts.noProductsDescription')}
            </p>
            <Link
              href={`/${locale}/products/add`}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('myProducts.addFirstProduct')}
            </Link>
          </div>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        message="Product deleted successfully!"
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
}