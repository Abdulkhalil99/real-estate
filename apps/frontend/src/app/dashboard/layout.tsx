'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, LayoutDashboard, Building2, MessageSquare,
  LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { authHelper } from '@/lib/auth';
import { authApi } from '@/lib/api';
import { User } from '@/types';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Overview'   },
  { href: '/dashboard/properties',  icon: Building2,       label: 'Properties' },
  { href: '/dashboard/inquiries',   icon: MessageSquare,   label: 'Inquiries'  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user,        setUser]        = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = authHelper.getUser();
    if (!u) { router.push('/auth/login'); return; }
    if (u.role === 'USER') { router.push('/'); return; }
    setUser(u);
  }, [router]);

  const handleLogout = async () => {
    try { const rt = authHelper.getRefreshToken(); if (rt) await authApi.logout(rt); } catch {}
    authHelper.clearSession();
    toast.success('Logged out');
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6f9' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f4f6f9' }}>

      {/* Sidebar */}
      <aside
        className={'fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ' +
          (sidebarOpen ? 'translate-x-0' : '-translate-x-full')}
        style={{ background: '#1a252f' }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" className="flex items-center gap-2.5 font-bold text-white">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#3498db' }}>
              <Home className="w-4 h-4 text-white" />
            </div>
            EstateHub
          </Link>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-4 mx-3 mt-3 rounded-xl" style={{ background: 'rgba(52,152,219,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="avatar avatar-md" style={{ background: '#3498db', color: 'white' }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs truncate" style={{ color: '#85929e' }}>{user.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-xs font-semibold px-3 mb-2 uppercase tracking-wider" style={{ color: '#566573' }}>
            Menu
          </p>
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
              style={{
                background: isActive(href) ? 'rgba(52,152,219,0.15)' : 'transparent',
                color:      isActive(href) ? '#3498db' : '#85929e',
              }}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive(href) && <ChevronRight className="w-4 h-4" />}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            style={{ color: '#85929e' }}>
            <Home className="w-5 h-5" />
            View website
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-colors"
            style={{ color: '#e74c3c' }}>
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 h-16"
          style={{ background: 'white', borderBottom: '1px solid #e8edf2' }}>
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" style={{ color: '#2c3e50' }} />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-base" style={{ color: '#2c3e50' }}>
              {NAV.find((n) => isActive(n.href))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="avatar avatar-sm" style={{ background: '#3498db', color: 'white' }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <span className="text-sm font-medium hidden sm:block" style={{ color: '#2c3e50' }}>
              {user.firstName}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
