'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Menu, X, User, LogOut, LayoutDashboard, ChevronDown, Heart } from 'lucide-react';
import { authHelper } from '@/lib/auth';
import { authApi } from '@/lib/api';
import { User as UserType } from '@/types';
import toast from 'react-hot-toast';

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [user,       setUser]       = useState<UserType | null>(null);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    setUser(authHelper.getUser());
    setMobileOpen(false);
    setDropOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = async () => {
    try {
      const rt = authHelper.getRefreshToken();
      if (rt) await authApi.logout(rt);
    } catch {}
    authHelper.clearSession();
    setUser(null);
    toast.success('Logged out');
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // لینک‌های عمومی — برای همه
  const publicLinks = [
    { href: '/',           label: 'Home'       },
    { href: '/properties', label: 'Properties' },
  ];

  return (
    <header className={
      'fixed top-0 inset-x-0 z-50 transition-all duration-200 ' +
      (scrolled ? 'bg-white border-b border-gray-100 shadow-sm' : 'bg-white/98 backdrop-blur-md')
    }>
      <nav className="container flex items-center justify-between h-16">

        {/* لوگو */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg"
          style={{ color: '#1a2332' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#3498db' }}>
            <Home className="w-4 h-4 text-white" />
          </div>
          EstateHub
        </Link>

        {/* لینک‌های دسکتاپ */}
        <div className="hidden md:flex items-center gap-1">
          {publicLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
                (isActive(link.href)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')}>
              {link.label}
            </Link>
          ))}

          {/* Favorites فقط برای یوزر لاگین */}
          {user && (
            <Link href="/favorites"
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ' +
                (isActive('/favorites')
                  ? 'text-red-500 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')}>
              <Heart className="w-4 h-4" style={{ fill: isActive('/favorites') ? '#ef4444' : 'none' }} />
              Favorites
            </Link>
          )}
        </div>

        {/* سمت راست */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="avatar avatar-sm">{user.firstName[0]}{user.lastName[0]}</div>
                <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                <ChevronDown className={'w-4 h-4 text-gray-400 transition-transform ' + (dropOpen ? 'rotate-180' : '')} />
              </button>

              {dropOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl border border-gray-100 shadow-xl py-1 z-20">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="font-semibold text-sm" style={{ color: '#1a2332' }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                    </div>

                    {(user.role === 'ADMIN' || user.role === 'AGENT') && (
                      <Link href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50">
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        Dashboard
                      </Link>
                    )}

                    <Link href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50">
                      <User className="w-4 h-4 text-gray-400" />
                      My profile
                    </Link>

                    <Link href="/favorites"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50">
                      <Heart className="w-4 h-4 text-gray-400" />
                      My favorites
                    </Link>

                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login"    className="btn btn-secondary btn-sm">Login</Link>
              <Link href="/auth/register" className="btn btn-primary  btn-sm">Get started</Link>
            </>
          )}
        </div>

        {/* موبایل */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-50"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen
            ? <X    className="w-5 h-5 text-gray-600" />
            : <Menu className="w-5 h-5 text-gray-600" />
          }
        </button>
      </nav>

      {/* منوی موبایل */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3">
          <div className="space-y-1 mb-4">
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={'block px-3 py-2.5 rounded-lg text-sm font-medium ' +
                  (isActive(link.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50')}>
                {link.label}
              </Link>
            ))}

            {/* Favorites فقط در موبایل برای یوزر لاگین */}
            {user && (
              <Link href="/favorites"
                className={'block px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ' +
                  (isActive('/favorites') ? 'bg-red-50 text-red-500' : 'text-gray-600 hover:bg-gray-50')}>
                <Heart className="w-4 h-4" />
                Favorites
              </Link>
            )}

            {user && (user.role === 'ADMIN' || user.role === 'AGENT') && (
              <Link href="/dashboard"
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Dashboard
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 flex gap-2">
            {user ? (
              <button onClick={handleLogout} className="btn btn-danger w-full btn-sm">
                Logout
              </button>
            ) : (
              <>
                <Link href="/auth/login"    className="btn btn-secondary flex-1 btn-sm">Login</Link>
                <Link href="/auth/register" className="btn btn-primary  flex-1 btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
