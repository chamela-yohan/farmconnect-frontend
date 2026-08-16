"use client";

import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function ProductGrid({ products, showActions, onDelete }: ProductGridProps) {
  const isSparse = products.length > 0 && products.length <= 2;

  if (isSparse) {
    return (
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {products.map((product) => (
          <div key={product.id} className="w-full max-w-[280px] sm:w-64">
            <ProductCard product={product} showActions={showActions} onDelete={() => onDelete?.(product.id)} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} showActions={showActions} onDelete={() => onDelete?.(product.id)} />
      ))}
    </div>
  );
}