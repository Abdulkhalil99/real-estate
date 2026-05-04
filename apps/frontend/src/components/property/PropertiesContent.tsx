'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';
import { propertyApi } from '@/lib/api';
import { Property, PropertyFilters } from '@/types';
import PropertyGrid from '@/components/property/PropertyGrid';

const STATUS_OPTIONS = [
  { value: '',         label: 'Any status' },
  { value: 'FOR_SALE', label: 'For sale'   },
  { value: 'FOR_RENT', label: 'For rent'   },
  { value: 'SOLD',     label: 'Sold'       },
  { value: 'RENTED',   label: 'Rented'     },
];
const TYPE_OPTIONS = [
  { value: '',           label: 'Any type'   },
  { value: 'HOUSE',      label: 'House'      },
  { value: 'APARTMENT',  label: 'Apartment'  },
  { value: 'CONDO',      label: 'Condo'      },
  { value: 'LAND',       label: 'Land'       },
  { value: 'COMMERCIAL', label: 'Commercial' },
];
const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first'    },
  { value: 'createdAt:asc',  label: 'Oldest first'    },
  { value: 'price:asc',      label: 'Price: low–high' },
  { value: 'price:desc',     label: 'Price: high–low' },
  { value: 'area:desc',      label: 'Largest first'   },
];
const BEDROOM_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

const PAGE_SIZE = 6;

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
      style={{ background: '#ebf5fb', color: '#1a6fa3', border: '1px solid #aed6f1' }}>
      {label}
      <button onClick={onRemove}><X className="w-3 h-3" /></button>
    </span>
  );
}

export default function PropertiesContent() {
  const searchParams = useSearchParams();

  const [properties,  setProperties]  = useState<Property[]>([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortValue,   setSortValue]   = useState('createdAt:desc');

  const [filters, setFilters] = useState<PropertyFilters>({
    q:         searchParams.get('q')        || '',
    status:    (searchParams.get('status')  || '') as PropertyFilters['status'],
    type:      (searchParams.get('type')    || '') as PropertyFilters['type'],
    city:      searchParams.get('city')     || '',
    minPrice:  searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice:  searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    bedrooms:  searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    sortBy:    'createdAt',
    sortOrder: 'desc',
  });

  const fetchFirst = useCallback(async (f: PropertyFilters) => {
    setLoading(true);
    setPage(1);
    try {
      const result = await propertyApi.getAll({ ...f, page: 1, limit: PAGE_SIZE });
      setProperties(result.items);
      setTotal(result.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFirst(filters); }, [filters, fetchFirst]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const result = await propertyApi.getAll({ ...filters, page: nextPage, limit: PAGE_SIZE });
      setProperties((prev) => [...prev, ...result.items]);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const updateFilter = (key: keyof PropertyFilters, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => {
    setFilters({ sortBy: 'createdAt', sortOrder: 'desc' });
    setSortValue('createdAt:desc');
  };

  const handleSort = (val: string) => {
    setSortValue(val);
    const [sortBy, sortOrder] = val.split(':');
    setFilters((prev) => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
  };

  const activeCount = [
    filters.q, filters.status, filters.type,
    filters.city, filters.minPrice, filters.maxPrice, filters.bedrooms,
  ].filter(Boolean).length;

  const hasMore = properties.length < total;

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8edf2' }}>
        <div className="container py-8">
          <h1 className="text-3xl font-bold" style={{ color: '#2c3e50' }}>Properties</h1>
          <p style={{ color: '#7f8c8d', marginTop: '0.25rem' }}>
            {loading ? 'Searching...' : `${total.toLocaleString()} properties found`}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className={'lg:w-72 flex-shrink-0 ' + (filtersOpen ? 'block' : 'hidden lg:block')}>
            <div className="card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold" style={{ color: '#2c3e50' }}>Filters</h2>
                {activeCount > 0 && (
                  <button onClick={clearFilters}
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: '#3498db' }}>
                    <X className="w-3 h-3" />Clear ({activeCount})
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Keyword</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: '#3498db' }} />
                    <input type="text" className="input pl-9"
                      placeholder="Villa, pool, sea view..."
                      value={filters.q || ''}
                      onChange={(e) => updateFilter('q', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="label">City</label>
                  <input type="text" className="input"
                    placeholder="Tunis, Sousse, Sfax..."
                    value={filters.city || ''}
                    onChange={(e) => updateFilter('city', e.target.value)} />
                </div>

                <div>
                  <label className="label">Listing type</label>
                  <div className="relative">
                    <select className="input appearance-none"
                      value={filters.status || ''}
                      onChange={(e) => updateFilter('status', e.target.value)}>
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: '#95a5a6' }} />
                  </div>
                </div>

                <div>
                  <label className="label">Property type</label>
                  <div className="relative">
                    <select className="input appearance-none"
                      value={filters.type || ''}
                      onChange={(e) => updateFilter('type', e.target.value)}>
                      {TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: '#95a5a6' }} />
                  </div>
                </div>

                <div>
                  <label className="label">Price range (TND)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className="input" placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)} />
                    <input type="number" className="input" placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)} />
                  </div>
                </div>

                <div>
                  <label className="label">Bedrooms</label>
                  <div className="flex gap-2 flex-wrap">
                    {BEDROOM_OPTIONS.map((o) => (
                      <button key={o.value}
                        onClick={() => updateFilter('bedrooms', o.value ? Number(o.value) : undefined)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: String(filters.bedrooms || '') === o.value ? '#3498db' : 'white',
                          color:      String(filters.bedrooms || '') === o.value ? 'white'   : '#2c3e50',
                          border:     '1.5px solid ' + (String(filters.bedrooms || '') === o.value ? '#3498db' : '#e0e6ed'),
                        }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-4">
              <button
                className="lg:hidden btn btn-secondary btn-sm flex items-center gap-2"
                onClick={() => setFiltersOpen(!filtersOpen)}>
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeCount > 0 && (
                  <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                    style={{ background: '#3498db' }}>
                    {activeCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm hidden sm:block" style={{ color: '#7f8c8d' }}>Sort:</span>
                <div className="relative">
                  <select className="input appearance-none pr-8 py-2 text-sm"
                    style={{ width: 180 }}
                    value={sortValue}
                    onChange={(e) => handleSort(e.target.value)}>
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: '#95a5a6' }} />
                </div>
              </div>
            </div>

            {/* Active filter pills */}
            {activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.q        && <FilterPill label={'"' + filters.q + '"'}                        onRemove={() => updateFilter('q',        '')}        />}
                {filters.status   && <FilterPill label={filters.status.replace('_', ' ')}              onRemove={() => updateFilter('status',   '')}        />}
                {filters.type     && <FilterPill label={filters.type}                                   onRemove={() => updateFilter('type',     '')}        />}
                {filters.city     && <FilterPill label={filters.city}                                   onRemove={() => updateFilter('city',     '')}        />}
                {filters.minPrice && <FilterPill label={'Min TND ' + filters.minPrice.toLocaleString()} onRemove={() => updateFilter('minPrice', undefined)} />}
                {filters.maxPrice && <FilterPill label={'Max TND ' + filters.maxPrice.toLocaleString()} onRemove={() => updateFilter('maxPrice', undefined)} />}
                {filters.bedrooms && <FilterPill label={filters.bedrooms + '+ beds'}                   onRemove={() => updateFilter('bedrooms', undefined)} />}
              </div>
            )}

            {/* Property grid */}
            <PropertyGrid properties={properties} loading={loading} />

            {/* Load more */}
            {!loading && hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn btn-secondary flex items-center gap-2 px-10"
                  style={{ borderColor: '#3498db', color: '#3498db' }}>
                  {loadingMore
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Loading...</>
                    : 'Show more'
                  }
                </button>
              </div>
            )}

            {/* End of results */}
            {!loading && !hasMore && properties.length > 0 && (
              <p className="text-center mt-10 text-sm" style={{ color: '#95a5a6' }}>
                All {total} properties loaded
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
