export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-muted" />

      {/* Content Skeleton */}
      <div className="p-3 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>

        {/* Price */}
        <div className="h-5 bg-muted rounded w-1/3" />

        {/* Farmer Info */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div className="w-6 h-6 rounded-full bg-muted" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-muted rounded w-2/3" />
            <div className="h-2 bg-muted rounded w-1/3" />
          </div>
        </div>

        {/* Button */}
        <div className="h-10 bg-muted rounded-lg" />
      </div>
    </div>
  );
}