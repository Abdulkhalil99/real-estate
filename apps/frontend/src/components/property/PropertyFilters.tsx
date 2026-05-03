'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Search, X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '',         label: 'Any status' },
  { value: 'FOR_SALE', label: 'For sale'   },
  { value: 'FOR_RENT', label: 'For rent'   },
  { value: 'SOLD',     label: 'Sold'       },
];

const TYPE_OPTIONS = [
  { value: '',           label: 'Any type'    },
  { value: 'HOUSE',      label: 'House'       },
  { value: 'APARTMENT',  label: 'Apartment'   },
  { value: 'CONDO',      label: 'Condo'       },
  { value: 'LAND',       label: 'Land'        },
  { value: 'COMMERCIAL', label: 'Commercial'  },
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest first'     },
  { value: 'createdAt-asc',  label: 'Oldest first'     },
  { value: 'price-asc',      label: 'Price: low → high'},
  { value: 'price-desc',     label: 'Price: high → low'},
  { value: 'area-desc',      label: 'Largest first'    },
];

export default function PropertyFilters() {
  const router     = useRouter();
  const params     = useSearchParams();

  const updateFilter = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    p.set('page', '1');
    router.push(`/properties?${p.toString()}`);
  }, [params, router]);

  const clearAll = () => router.push('/properties');

  const hasFilters = ['q', 'status', 'type', 'minPrice', 'maxPrice', 'city'].some(
    (k) => params.has(k)
  );

  const sortValue = params.get('sortBy')
    ? `${params.get('sortBy')}-${params.get('sortOrder') || 'desc'}`
    : 'createdAt-desc';

  const handleSort = (val: string) => {
    const [sortBy, sortOrder] = val.split('-');
    const p = new URLSearchParams(params.toString());
    p.set('sortBy', sortBy);
    p.set('sortOrder', sortOrder);
    router.push(`/properties?${p.toString()}`);
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
      <div className="container py-4">
        {/* Search row */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-10"
              placeholder="Search city, address, keyword..."
              defaultValue={params.get('q') || ''}
              onChange={(e) => {
                const val = e.target.value;
                clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>)._searchTimer);
                (window as unknown as Record<string, ReturnType<typeof setTimeout>>)._searchTimer =
                  setTimeout(() => updateFilter('q', val), 400);
              }}
            />
          </div>
          {hasFilters && (
            <button onClick={clearAll} className="btn btn-secondary btn-sm gap-1.5">
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Filter chips row */}
        <div className="flex gap-2 flex-wrap items-center">
          <select
            className="input"
            style={{ width: 'auto', minWidth: 130 }}
            value={params.get('status') || ''}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            className="input"
            style={{ width: 'auto', minWidth: 130 }}
            value={params.get('type') || ''}
            onChange={(e) => updateFilter('type', e.target.value)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <input
            className="input"
            style={{ width: 130 }}
            type="number"
            placeholder="Min price"
            defaultValue={params.get('minPrice') || ''}
            onChange={(e) => {
              clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>)._minTimer);
              (window as unknown as Record<string, ReturnType<typeof setTimeout>>)._minTimer =
                setTimeout(() => updateFilter('minPrice', e.target.value), 600);
            }}
          />

          <input
            className="input"
            style={{ width: 130 }}
            type="number"
            placeholder="Max price"
            defaultValue={params.get('maxPrice') || ''}
            onChange={(e) => {
              clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>)._maxTimer);
              (window as unknown as Record<string, ReturnType<typeof setTimeout>>)._maxTimer =
                setTimeout(() => updateFilter('maxPrice', e.target.value), 600);
            }}
          />

          <select
            className="input ml-auto"
            style={{ width: 'auto', minWidth: 160 }}
            value={sortValue}
            onChange={(e) => handleSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}