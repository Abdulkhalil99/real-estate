'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pagination as PT } from '@/types';

export default function Pagination({ pagination, onPageChange }: { pagination: PT; onPageChange: (p: number) => void }) {
  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
  else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">Page {page} of {totalPages} — {pagination.total} results</p>
      <div className="flex items-center gap-1">
        <button className={cn('page-btn', !hasPrevPage && 'opacity-40 cursor-not-allowed')} onClick={() => hasPrevPage && onPageChange(page - 1)} disabled={!hasPrevPage}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? <span key={'e' + i} className="page-btn cursor-default text-gray-400">…</span> :
          <button key={p} className={cn('page-btn', p === page && 'page-btn-active')} onClick={() => onPageChange(p as number)}>{p}</button>
        )}
        <button className={cn('page-btn', !hasNextPage && 'opacity-40 cursor-not-allowed')} onClick={() => hasNextPage && onPageChange(page + 1)} disabled={!hasNextPage}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
