"use client";

import { Loader2 } from "lucide-react";

export function ChartSkeleton() {
  return (
    <div className="h-64 w-full flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function ChartError() {
  return (
    <div className="h-64 w-full flex flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm font-medium text-destructive">Couldn't load chart data</p>
      <p className="text-xs text-muted-foreground">Refresh the page to try again</p>
    </div>
  );
}