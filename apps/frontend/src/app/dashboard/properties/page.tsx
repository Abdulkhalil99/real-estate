'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { propertyApi, getErrorMessage } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { Property } from '@/types';
import { formatPrice, getPrimaryImage, getStatusConfig } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import { Pagination as PT } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPropertiesPage() {
  const [properties,  setProperties]  = useState<Property[]>([]);
  const [pagination,  setPagination]  = useState<PT | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [deleting,    setDeleting]    = useState(false);
  const user = authHelper.getUser();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const isAdmin = user?.role === 'ADMIN';
      const result  = isAdmin
        ? await propertyApi.getAll({ page, limit: 10, q: search })
        : await propertyApi.getMyListings({ page, limit: 10, q: search });
      setProperties(result.items);
      setPagination(result.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, user?.role]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await propertyApi.delete(deleteId);
      toast.success('Property deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#2c3e50' }}>My Properties</h2>
          <p className="text-sm" style={{ color: '#7f8c8d' }}>
            {pagination ? pagination.total + ' total listings' : ''}
          </p>
        </div>
        <Link href="/dashboard/properties/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />New property
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#95a5a6' }} />
          <input type="text" className="input pl-10" placeholder="Search properties..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#ebf5fb' }}>
              <Plus className="w-7 h-7" style={{ color: '#3498db' }} />
            </div>
            <p className="font-semibold" style={{ color: '#2c3e50' }}>No properties yet</p>
            <Link href="/dashboard/properties/new" className="btn btn-primary btn-sm">Add your first listing</Link>
          </div>
        ) : (
          <div className="table-wrap" style={{ borderRadius: '1rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>City</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => {
                  const { label, className } = getStatusConfig(p.status);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden flex-shrink-0"
                            style={{ background: '#f0f3f6' }}>
                            <Image src={getPrimaryImage(p.images)} alt={p.title} fill className="object-cover" sizes="48px" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate max-w-48" style={{ color: '#2c3e50' }}>
                              {p.title}
                            </p>
                            <p className="text-xs" style={{ color: '#95a5a6' }}>
                              {p.bedrooms} bd · {p.bathrooms} ba · {p.area}m²
                            </p>
                          </div>
                        </div>
                      </td>
                      <td><span className={'badge ' + className}>{label}</span></td>
                      <td className="font-semibold text-sm" style={{ color: '#3498db' }}>
                        {formatPrice(p.price, p.status)}
                      </td>
                      <td className="text-sm" style={{ color: '#5d6d7e' }}>{p.city}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link href={'/properties/' + p.id}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            title="View">
                            <Eye className="w-4 h-4" style={{ color: '#7f8c8d' }} />
                          </Link>
                          <Link href={'/dashboard/properties/' + p.id + '/edit'}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: '#ebf5fb' }}
                            title="Edit">
                            <Pencil className="w-4 h-4" style={{ color: '#3498db' }} />
                          </Link>
                          <button
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: '#fadbd8' }}
                            onClick={() => setDeleteId(p.id)}
                            title="Delete">
                            <Trash2 className="w-4 h-4" style={{ color: '#e74c3c' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && !loading && (
          <div className="p-4">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Delete property</h2>
            </div>
            <div className="modal-body">
              <p style={{ color: '#5d6d7e' }}>
                Are you sure you want to delete this property? This action cannot be undone.
                All images and inquiries will also be deleted.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting
                  ? <span className="spinner" style={{ width: 16, height: 16 }} />
                  : 'Delete'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
