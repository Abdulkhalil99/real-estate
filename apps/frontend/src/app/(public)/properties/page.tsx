import { Suspense } from 'react';
import PropertiesContent from '@/components/property/PropertiesContent';

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6f9' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}
