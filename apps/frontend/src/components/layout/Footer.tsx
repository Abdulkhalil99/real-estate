import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#0f1923', color: '#64748b' }}>
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#f97316' }}>
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-white text-lg">EstateHub</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Your trusted partner in finding the perfect property across Tunisia.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Properties</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['For sale',    '/properties?status=FOR_SALE'],
                ['For rent',    '/properties?status=FOR_RENT'],
                ['Apartments',  '/properties?type=APARTMENT'],
                ['Houses',      '/properties?type=HOUSE'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-orange-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['About us',      '/about'],
                ['Contact',       '/contact'],
                ['Join as agent', '/auth/register'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-orange-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-sm text-center" style={{ borderColor: '#1e2d40' }}>
          © {new Date().getFullYear()} EstateHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
