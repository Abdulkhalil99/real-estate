'use client';
import Link from 'next/link';
import { Home, Building2, TreePine, Store, Castle } from 'lucide-react';

const TYPES = [
  { label: 'Houses',     icon: Home,      type: 'HOUSE',      bg: '#ebf5fb', color: '#1a6fa3' },
  { label: 'Apartments', icon: Building2, type: 'APARTMENT',  bg: '#d5f5e3', color: '#1e8449' },
  { label: 'Condos',     icon: Castle,    type: 'CONDO',      bg: '#fef9e7', color: '#9a7d0a' },
  { label: 'Land',       icon: TreePine,  type: 'LAND',       bg: '#e8f8f5', color: '#0e6655' },
  { label: 'Commercial', icon: Store,     type: 'COMMERCIAL', bg: '#f4ecf7', color: '#76448a' },
];

export default function HomeTypes() {
  return (
    <section className="section" style={{ background: '#f4f6f9' }}>
      <div className="container">
        <div className="text-center mb-10">
          <p className="section-eyebrow">Browse by type</p>
          <h2 className="section-title">What are you looking for?</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {TYPES.map(({ label, icon: Icon, type, bg, color }) => (
            <Link key={type} href={'/properties?type=' + type}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white text-center transition-all duration-200"
              style={{ border: '1.5px solid #e8edf2' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3498db';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(52,152,219,0.15)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e8edf2';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ background: bg, color }}>
                <Icon className="w-7 h-7" />
              </div>
              <span className="font-semibold text-sm" style={{ color: '#2c3e50' }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
