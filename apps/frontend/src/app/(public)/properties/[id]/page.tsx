import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Bed, Bath, Maximize2, MapPin, Calendar, Phone, Mail, ArrowLeft, Home } from 'lucide-react';
import { propertyApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/Badge';
import { formatPrice, formatArea, formatDate, getTypeLabel } from '@/lib/utils';
import InquiryForm from '@/components/forms/InquiryForm';
import ImageGallery from '@/components/property/ImageGallery';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const p = await propertyApi.getById(id);
    return { title: p.title + ' — EstateHub', description: p.description.slice(0, 160) };
  } catch {
    return { title: 'Property not found' };
  }
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let property;
  try { property = await propertyApi.getById(id); }
  catch { notFound(); }

  const details = [
    { label: 'Property type', value: getTypeLabel(property.type) },
    { label: 'Status',        value: property.status.replace('_', ' ') },
    { label: 'Bedrooms',      value: String(property.bedrooms) },
    { label: 'Bathrooms',     value: String(property.bathrooms) },
    { label: 'Area',          value: formatArea(property.area) },
    ...(property.yearBuilt ? [{ label: 'Year built', value: String(property.yearBuilt) }] : []),
    { label: 'City',    value: property.city    },
    { label: 'Country', value: property.country },
  ];

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8edf2' }}>
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#7f8c8d' }}>
            <Link href="/" className="flex items-center gap-1 hover:text-gray-900">
              <Home className="w-4 h-4" />Home
            </Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-gray-900">Properties</Link>
            <span>/</span>
            <span className="truncate max-w-xs font-medium" style={{ color: '#2c3e50' }}>
              {property.title}
            </span>
          </div>
        </div>
      </div>

      <div className="container pt-8">

        {/* Back link — no event handlers, just CSS hover */}
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-blue-500"
          style={{ color: '#7f8c8d' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>

        {/* Image gallery */}
        <ImageGallery images={property.images} title={property.title} />

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

          {/* Left */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header card */}
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={property.status} />
                    {property.featured && (
                      <span className="badge badge-featured">Featured</span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold leading-snug" style={{ color: '#2c3e50' }}>
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-2" style={{ color: '#7f8c8d' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#3498db' }} />
                    <span className="text-sm">
                      {property.address}, {property.city}, {property.state}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{ color: '#3498db' }}>
                    {formatPrice(property.price, property.status)}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#95a5a6' }}>
                    Listed {formatDate(property.createdAt)}
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6"
                style={{ borderTop: '1px solid #f0f3f6' }}>
                {[
                  { icon: Bed,       value: property.bedrooms,  label: 'Bedrooms'  },
                  { icon: Bath,      value: property.bathrooms, label: 'Bathrooms' },
                  { icon: Maximize2, value: property.area,      label: 'm²'        },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="text-center">
                    <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: '#3498db' }} />
                    <div className="text-xl font-bold" style={{ color: '#2c3e50' }}>{value}</div>
                    <div className="text-xs" style={{ color: '#7f8c8d' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4" style={{ color: '#2c3e50' }}>Description</h2>
              <p className="leading-relaxed whitespace-pre-line"
                style={{ color: '#5d6d7e', fontSize: '0.9375rem' }}>
                {property.description}
              </p>
            </div>

            {/* Details table */}
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4" style={{ color: '#2c3e50' }}>Property details</h2>
              <div className="grid grid-cols-2 gap-x-6">
                {details.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: '1px solid #f4f6f9' }}>
                    <span className="text-sm" style={{ color: '#7f8c8d' }}>{label}</span>
                    <span className="text-sm font-semibold capitalize" style={{ color: '#2c3e50' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right — agent + inquiry */}
          <div className="space-y-5">

            {/* Agent card */}
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide mb-4"
                style={{ color: '#95a5a6' }}>
                Listed by
              </p>
              <div className="flex items-center gap-3 mb-4">
                <div className="avatar avatar-lg">
                  {property.agent.firstName[0]}{property.agent.lastName[0]}
                </div>
                <div>
                  <p className="font-bold" style={{ color: '#2c3e50' }}>
                    {property.agent.firstName} {property.agent.lastName}
                  </p>
                  <p className="text-xs" style={{ color: '#7f8c8d' }}>Verified Agent</p>
                </div>
              </div>
              <div className="space-y-2">
                {property.agent.phone && (
                  <a href={'tel:' + property.agent.phone}
                    className="flex items-center gap-2.5 w-full btn btn-secondary btn-sm">
                    <Phone className="w-4 h-4" style={{ color: '#3498db' }} />
                    {property.agent.phone}
                  </a>
                )}
                {property.agent.email && (
                  <a href={'mailto:' + property.agent.email}
                    className="flex items-center gap-2.5 w-full btn btn-secondary btn-sm">
                    <Mail className="w-4 h-4" style={{ color: '#3498db' }} />
                    Email agent
                  </a>
                )}
              </div>
            </div>

            {/* Inquiry form */}
            <div className="card p-5">
              <h3 className="font-bold mb-4" style={{ color: '#2c3e50' }}>Send inquiry</h3>
              <InquiryForm propertyId={property.id} />
            </div>

            {/* Key facts */}
            <div className="card p-5">
              <h3 className="font-bold mb-3 text-sm" style={{ color: '#2c3e50' }}>Key facts</h3>
              <div className="space-y-2.5 text-sm" style={{ color: '#5d6d7e' }}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#3498db' }} />
                  Listed on {formatDate(property.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: '#3498db' }} />
                  {property.city}, {property.country}
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" style={{ color: '#3498db' }} />
                  {getTypeLabel(property.type)}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
