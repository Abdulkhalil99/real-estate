'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Maximize2, MapPin, Heart } from 'lucide-react';
import { Property } from '@/types';
import { formatPrice, formatArea, getPrimaryImage } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { useFavorites } from '@/hooks/useFavorites';
import toast from 'react-hot-toast';

export default function PropertyCard({ property }: { property: Property }) {
  const image = getPrimaryImage(property.images);
  const { isFavorite, toggle } = useFavorites();
  const liked = isFavorite(property.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(property.id);
    toast.success(added ? 'Added to favorites' : 'Removed from favorites');
  };

  return (
    <Link href={'/properties/' + property.id} className="group block">
      <div className="card card-hover">

        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Status badge */}
          <div className="absolute top-2.5 left-2.5">
            <StatusBadge status={property.status} />
          </div>

          {/* Featured badge */}
          {property.featured && (
            <div className="absolute top-2.5 right-10">
              <span className="badge badge-featured">Featured</span>
            </div>
          )}

          {/* Heart button */}
          <button
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all"
            style={{
              background: liked ? '#e74c3c' : 'rgba(255,255,255,0.92)',
            }}
            onClick={handleFavorite}
            title={liked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className="w-4 h-4 transition-transform"
              style={{
                color:    liked ? 'white' : '#95a5a6',
                fill:     liked ? 'white' : 'none',
                transform: liked ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-xl font-bold mb-0.5" style={{ color: '#3498db' }}>
            {formatPrice(property.price, property.status)}
          </div>
          <h3 className="font-semibold text-sm leading-snug mb-1.5 line-clamp-1"
            style={{ color: '#2c3e50' }}>
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-xs mb-3" style={{ color: '#95a5a6' }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.city}, {property.state}</span>
          </div>
          <div className="flex items-center gap-4 text-xs pb-3"
            style={{ color: '#7f8c8d', borderBottom: '1px solid #f0f3f6' }}>
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" style={{ color: '#3498db' }} />
              {property.bedrooms} bd
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" style={{ color: '#3498db' }} />
              {property.bathrooms} ba
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" style={{ color: '#3498db' }} />
              {formatArea(property.area)}
            </span>
          </div>
          {property.agent && (
            <div className="flex items-center gap-2 pt-3">
              <div className="avatar avatar-sm text-xs">
                {property.agent.firstName[0]}{property.agent.lastName[0]}
              </div>
              <span className="text-xs" style={{ color: '#95a5a6' }}>
                {property.agent.firstName} {property.agent.lastName}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
