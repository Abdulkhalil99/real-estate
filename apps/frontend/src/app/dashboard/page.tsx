'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, MessageSquare, TrendingUp, Star, Plus, ArrowRight } from 'lucide-react';
import { propertyApi, inquiryApi } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { PropertyStats, Inquiry } from '@/types';

export default function DashboardPage() {
  const [stats,     setStats]     = useState<PropertyStats | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const user = authHelper.getUser();

  useEffect(() => {
    const load = async () => {
      try {
        const [s, iq] = await Promise.all([
          propertyApi.getStats(),
          inquiryApi.getAll(1),
        ]);
        setStats(s);
        setInquiries(iq.items.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total listings', value: stats?.total    ?? 0, icon: Building2,    color: '#3498db', bg: '#ebf5fb' },
    { label: 'For sale',       value: stats?.forSale  ?? 0, icon: TrendingUp,   color: '#27ae60', bg: '#d5f5e3' },
    { label: 'For rent',       value: stats?.forRent  ?? 0, icon: Star,         color: '#f39c12', bg: '#fef9e7' },
    { label: 'New inquiries',  value: inquiries.filter((i) => i.status === 'NEW').length,
                                                              icon: MessageSquare, color: '#8e44ad', bg: '#f4ecf7' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="card p-6" style={{ background: 'linear-gradient(135deg, #2c3e50, #1a252f)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Welcome back, {user?.firstName}! 👋
            </h2>
            <p style={{ color: '#85929e' }} className="text-sm">
              Here is what is happening with your listings today.
            </p>
          </div>
          <Link href="/dashboard/properties/new" className="btn btn-primary btn-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New listing
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ color: '#2c3e50' }}>{value}</div>
            <div className="text-sm" style={{ color: '#7f8c8d' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent inquiries */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #f0f3f6' }}>
          <h3 className="font-bold" style={{ color: '#2c3e50' }}>Recent inquiries</h3>
          <Link href="/dashboard/inquiries" className="text-sm font-medium flex items-center gap-1"
            style={{ color: '#3498db' }}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {inquiries.length === 0 ? (
          <div className="p-8 text-center" style={{ color: '#95a5a6' }}>
            No inquiries yet
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f0f3f6' }}>
            {inquiries.map((inq) => (
              <div key={inq.id} className="flex items-center gap-4 px-6 py-4">
                <div className="avatar avatar-sm" style={{ background: '#ebf5fb', color: '#1a6fa3' }}>
                  {inq.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: '#2c3e50' }}>{inq.name}</p>
                  <p className="text-xs truncate" style={{ color: '#95a5a6' }}>
                    {inq.property?.title || 'Unknown property'}
                  </p>
                </div>
                <span className={'badge ' + (
                  inq.status === 'NEW'       ? 'badge-rent' :
                  inq.status === 'CONTACTED' ? 'badge-featured' : 'badge-sold'
                )}>
                  {inq.status.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/properties/new', label: 'Add new property', icon: Plus,          color: '#3498db', bg: '#ebf5fb' },
          { href: '/dashboard/properties',     label: 'Manage listings',  icon: Building2,      color: '#27ae60', bg: '#d5f5e3' },
          { href: '/dashboard/inquiries',      label: 'View inquiries',   icon: MessageSquare,  color: '#8e44ad', bg: '#f4ecf7' },
        ].map(({ href, label, icon: Icon, color, bg }) => (
          <Link key={href} href={href}
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <span className="font-medium text-sm" style={{ color: '#2c3e50' }}>{label}</span>
            <ArrowRight className="w-4 h-4 ml-auto" style={{ color: '#bdc3c7' }} />
          </Link>
        ))}
      </div>

    </div>
  );
}
