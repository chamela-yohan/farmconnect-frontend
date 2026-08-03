"use client";

import { Trophy } from "lucide-react";
import { useFarmerTopProducts } from "@/lib/api/farmer";

export function TopProductsWidget() {
  const { data: products, isLoading, isError } = useFarmerTopProducts();

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top-Selling Products</h3>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground py-6 text-center">Couldn't load top products.</p>
      )}

      {!isLoading && !isError && products?.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Nothing sold yet — your best-sellers will show up here.
        </p>
      )}

      {!isLoading && !isError && products && products.length > 0 && (
        <ul className="divide-y divide-border">
          {products.map((product, index) => (
            <li key={product.productId} className="py-3 flex items-center gap-3">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                  index === 0 ? "bg-yellow-500/15 text-yellow-600"
                  : index === 1 ? "bg-slate-400/15 text-slate-500"
                  : index === 2 ? "bg-orange-500/15 text-orange-600"
                  : "bg-muted text-muted-foreground"
                }`}
              >
                {index === 0 ? <Trophy className="w-3.5 h-3.5" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                <p className="text-xs text-muted-foreground">{product.totalQuantitySold} sold</p>
              </div>
              <span className="text-sm font-semibold text-foreground shrink-0">
                LKR {product.totalRevenue.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}