'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { propertyApi } from '@/lib/api';
import { Property } from '@/types';
import PropertyForm from '@/components/dashboard/PropertyForm';
import { PageSpinner } from '@/components/ui/Spinner';

export default function EditPropertyPage() {
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const p = await propertyApi.getById(params.id as string);
        setProperty(p);
      } catch {
        setError('Property not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) return <PageSpinner />;
  if (error)   return <div className="text-center py-16" style={{ color: '#e74c3c' }}>{error}</div>;
  if (!property) return null;

  return <PropertyForm property={property} />;
}
