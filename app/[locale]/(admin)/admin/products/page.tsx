"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdminProducts, useToggleProductVisibility } from "@/lib/api/admin";
import { Pagination } from "@/components/ui/Pagination";
import { Search, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError } = useAdminProducts(debouncedSearch, page);
  const toggleMutation = useToggleProductVisibility();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Product Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data ? `${data.totalElements} products` : "Loading..."}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search by product title..."
          className="w-full h-10 pl-9 pr-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <p className="text-center py-16 text-sm text-destructive">Couldn't load products.</p>
        ) : data && data.content.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Farmer</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Visibility</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.content.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{product.title}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{product.farmerName}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{product.categoryName}</td>
                  <td className="px-4 py-3 text-foreground">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.isDeleted ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"}`}>
                      {product.isDeleted ? "Hidden" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleMutation.mutate({ productId: product.id, hide: !product.isDeleted })}
                      disabled={toggleMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {product.isDeleted ? (<><Eye className="w-3.5 h-3.5" /> Activate</>) : (<><EyeOff className="w-3.5 h-3.5" /> Deactivate</>)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-16 text-sm text-muted-foreground">No products found.</p>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <Pagination currentPage={data.number} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}