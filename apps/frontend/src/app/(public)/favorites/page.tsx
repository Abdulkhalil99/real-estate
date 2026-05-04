'use client';
import { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { propertyApi } from '@/lib/api';
import { Property } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import PropertyCard from '@/components/property/PropertyCard';
import Link from 'next/link';

export default function FavoritesPage() {
  const { favorites, clear } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      if (favorites.length === 0) { setLoading(false); return; }
      setLoading(true);
      try {
        // Fetch each favorited property
        const results = await Promise.allSettled(
          favorites.map((id) => propertyApi.getById(id))
        );
        const loaded = results
          .filter((r): r is PromiseFulfilledResult<Property> => r.status === 'fulfilled')
          .map((r) => r.value);
        setProperties(loaded);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [favorites]);

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8edf2' }}>
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#2c3e50' }}>
                <Heart className="w-7 h-7" style={{ color: '#e74c3c', fill: '#e74c3c' }} />
                My Favorites
              </h1>
              <p className="text-sm mt-1" style={{ color: '#7f8c8d' }}>
                {loading
                  ? 'Loading...'
                  : favorites.length === 0
                    ? 'No saved properties yet'
                    : `${favorites.length} saved ${favorites.length === 1 ? 'property' : 'properties'}`
                }
              </p>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={clear}
                className="btn btn-secondary btn-sm flex items-center gap-2"
                style={{ color: '#e74c3c', borderColor: '#f1948a' }}>
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        )}

        {/* Empty state */}
        {!loading && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: '#fadbd8' }}>
              <Heart className="w-10 h-10" style={{ color: '#e74c3c' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#2c3e50' }}>
              No favorites yet
            </h2>
            <p className="text-sm mb-6 max-w-sm" style={{ color: '#7f8c8d' }}>
              Browse properties and click the heart icon to save your favorites here.
            </p>
            <Link href="/properties" className="btn btn-primary">
              Browse properties
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}

        {/* Some properties may have been deleted */}
        {!loading && favorites.length > 0 && properties.length < favorites.length && (
          <p className="text-center text-sm mt-6" style={{ color: '#95a5a6' }}>
            Some saved properties are no longer available.
          </p>
        )}
      </div>
    </div>
  );
}
