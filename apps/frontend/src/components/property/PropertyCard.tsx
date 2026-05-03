'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Maximize2, MapPin, Heart } from 'lucide-react';
import { Property } from '@/types';
import { formatPrice, formatArea, getPrimaryImage } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';

export default function PropertyCard({ property }: { property: Property }) {
  const image = getPrimaryImage(property.images);
  return (
    <Link href={'/properties/' + property.id} className="group block">
      <div className="card card-hover">
        <div className="relative h-44 overflow-hidden">
          <Image src={image} alt={property.title} fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
          <div className="absolute top-2.5 left-2.5"><StatusBadge status={property.status} /></div>
          {property.featured && (
            <div className="absolute top-2.5 right-8">
              <span className="badge badge-featured">Featured</span>
            </div>
          )}
          <button
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            onClick={(e) => e.preventDefault()}>
            <Heart className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
        <div className="p-3.5">
          <div className="text-lg font-bold mb-0.5" style={{ color: '#3498db' }}>
            {formatPrice(property.price, property.status)}
          </div>
          <h3 className="font-semibold text-sm leading-snug mb-1.5 line-clamp-1" style={{ color: '#2c3e50' }}>
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-xs mb-3" style={{ color: '#95a5a6' }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.city}, {property.state}</span>
          </div>
          <div className="flex items-center gap-3 text-xs pb-3 border-b" style={{ color: '#7f8c8d', borderColor: '#f0f3f6' }}>
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" style={{ color: '#3498db' }} />{property.bedrooms} bd
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" style={{ color: '#3498db' }} />{property.bathrooms} ba
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" style={{ color: '#3498db' }} />{formatArea(property.area)}
            </span>
          </div>
          {property.agent && (
            <div className="flex items-center gap-2 pt-2.5">
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
