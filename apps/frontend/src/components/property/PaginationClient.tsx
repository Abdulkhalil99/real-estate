'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import { Pagination as PaginationType } from '@/types';

export default function PaginationClient({ pagination }: { pagination: PaginationType }) {
  const router = useRouter();
  const params = useSearchParams();

  const handlePageChange = (page: number) => {
    const p = new URLSearchParams(params.toString());
    p.set('page', String(page));
    router.push(`/properties?${p.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Pagination pagination={pagination} onPageChange={handlePageChange} />
  );
}