'use client';
import Link from 'next/link';
import { Search, Shield } from 'lucide-react';

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a252f 0%, #2c3e50 60%, #2e4057 100%)' }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3498db, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3498db, transparent)' }} />

      <div className="container relative py-28 md:py-40">
        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border"
            style={{ background: 'rgba(52,152,219,0.12)', borderColor: 'rgba(52,152,219,0.3)' }}>
            <Shield className="w-4 h-4" style={{ color: '#5dade2' }} />
            <span className="text-sm font-medium" style={{ color: '#aed6f1' }}>
              Trusted by 2,000+ families in Tunisia
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white">
            Find Your Perfect{' '}
            <span style={{ color: '#3498db' }}>Home</span>
          </h1>

          <p className="text-lg mb-10 leading-relaxed" style={{ color: '#85929e' }}>
            Browse hundreds of verified properties across Tunisia.
            Houses, apartments, and commercial spaces — all in one place.
          </p>

          <div className="bg-white rounded-2xl p-2 flex gap-2 shadow-2xl max-w-2xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-5 h-5 flex-shrink-0" style={{ color: '#3498db' }} />
              <input type="text"
                placeholder="Search by city, address, or keyword..."
                className="w-full py-2.5 text-sm outline-none bg-transparent"
                style={{ color: '#2c3e50' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                    window.location.href = '/properties?q=' + encodeURIComponent((e.target as HTMLInputElement).value);
                }}
              />
            </div>
            <Link href="/properties" className="btn btn-primary whitespace-nowrap">
              Search Properties
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="text-sm" style={{ color: '#566573' }}>Popular:</span>
            {['Tunis', 'Sousse', 'Sfax', 'For Rent', 'For Sale'].map((tag) => (
              <Link key={tag} href={'/properties?q=' + tag}
                className="text-sm underline underline-offset-2 transition-colors"
                style={{ color: '#85929e' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#3498db')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#85929e')}>
                {tag}
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
