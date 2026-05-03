'use client';
import { Property } from '@/types';
import PropertyCard from './PropertyCard';
import PropertyCardSkeleton from './PropertyCardSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Home } from 'lucide-react';

export default function PropertyGrid({
  properties, loading,
  emptyTitle = 'No properties found',
  emptyDesc  = 'Try adjusting your filters.',
  columns = 4,
}: {
  properties:  Property[];
  loading?:    boolean;
  emptyTitle?: string;
  emptyDesc?:  string;
  columns?:    3 | 4;
}) {
  const gridClass = columns === 4
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: columns === 4 ? 8 : 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return <EmptyState icon={Home} title={emptyTitle} description={emptyDesc} />;
  }

  return (
    <div className={gridClass}>
      {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
    </div>
  );
}
