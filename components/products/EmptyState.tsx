"use client";

import { PackageSearch } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const t = useTranslations('products');

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-muted rounded-full mb-4">
        <PackageSearch className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || t('empty.title')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {description || t('empty.description')}
      </p>
    </div>
  );
}