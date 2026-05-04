'use client';
import { Property } from '@/types';
import PropertyCard from './PropertyCard';
import PropertyCardSkeleton from './PropertyCardSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Home } from 'lucide-react';

export default function PropertyGrid({
  properties,
  loading,
  emptyTitle = 'No properties found',
  emptyDesc  = 'Try adjusting your filters.',
}: {
  properties:  Property[];
  loading?:    boolean;
  emptyTitle?: string;
  emptyDesc?:  string;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title={emptyTitle}
        description={emptyDesc}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}
