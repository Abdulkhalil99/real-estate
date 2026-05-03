import Link from 'next/link';
import { propertyApi } from '@/lib/api';
import PropertyCard from '@/components/property/PropertyCard';
import HomeHero from '@/components/home/HomeHero';
import HomeTypes from '@/components/home/HomeTypes';
import { PropertyStats, Property } from '@/types';

async function getData(): Promise<{ featured: Property[]; stats: PropertyStats }> {
  try {
    const [featured, stats] = await Promise.all([propertyApi.getFeatured(), propertyApi.getStats()]);
    return { featured, stats };
  } catch {
    return { featured: [], stats: { total: 0, forSale: 0, forRent: 0, sold: 0, rented: 0, featured: 0 } };
  }
}

export default async function HomePage() {
  const { featured, stats } = await getData();
  return (
    <div>
      <HomeHero />
      <section className="bg-white border-b border-gray-100">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ value: stats.total, label: 'Total listings' }, { value: stats.forSale, label: 'For sale' }, { value: stats.forRent, label: 'For rent' }, { value: stats.sold, label: 'Sold this year' }].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-gray-900">{s.value.toLocaleString()}+</div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-gray-50">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-eyebrow">Hand-picked</p>
              <h2 className="section-title">Featured Properties</h2>
            </div>
            <Link href="/properties?featured=true" className="hidden md:flex items-center gap-2 text-blue-700 font-semibold text-sm">View all →</Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">No featured properties yet.</div>
          )}
        </div>
      </section>
      <HomeTypes />
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <p className="section-eyebrow">Simple process</p>
            <h2 className="section-title">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[{ step: '01', title: 'Search & filter', desc: 'Use smart filters to narrow down by city, type, price and size.', color: 'bg-blue-600' }, { step: '02', title: 'Contact the agent', desc: 'Send a direct inquiry to the listing agent with one click.', color: 'bg-purple-600' }, { step: '03', title: 'Move in', desc: 'Schedule a visit, finalize paperwork, and get the keys.', color: 'bg-green-600' }].map((item) => (
              <div key={item.step} className="text-center">
                <div className={item.color + ' text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm mx-auto mb-4'}>{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section text-white" style={{ background: "#1a2332" }}>
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Are you an agent or property owner?</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">List your property for free and reach thousands of buyers across Tunisia.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn btn-lg bg-white text-blue-700 hover:bg-blue-50">List a property — it&apos;s free</Link>
            <Link href="/properties"   className="btn btn-lg border border-white/30 text-white hover:bg-white/10">Browse listings</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
