'use client';
import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, CheckCircle, Phone, Mail } from 'lucide-react';
import { inquiryApi, getErrorMessage } from '@/lib/api';
import { Inquiry, Pagination as PT } from '@/types';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  NEW:       'badge-rent',
  CONTACTED: 'badge-featured',
  CLOSED:    'badge-sold',
};

export default function InquiriesPage() {
  const [inquiries,  setInquiries]  = useState<Inquiry[]>([]);
  const [pagination, setPagination] = useState<PT | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [updating,   setUpdating]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inquiryApi.getAll(page);
      setInquiries(result.items);
      setPagination(result.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await inquiryApi.updateStatus(id, status);
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-5">

      <div>
        <h2 className="text-xl font-bold" style={{ color: '#2c3e50' }}>Inquiries</h2>
        <p className="text-sm" style={{ color: '#7f8c8d' }}>
          {pagination ? pagination.total + ' total inquiries' : ''}
        </p>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#ebf5fb' }}>
              <MessageSquare className="w-7 h-7" style={{ color: '#3498db' }} />
            </div>
            <p className="font-semibold" style={{ color: '#2c3e50' }}>No inquiries yet</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f0f3f6' }}>
            {inquiries.map((inq) => (
              <div key={inq.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="avatar avatar-md mt-0.5" style={{ background: '#ebf5fb', color: '#1a6fa3' }}>
                      {inq.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-sm" style={{ color: '#2c3e50' }}>{inq.name}</p>
                        <span className={'badge ' + STATUS_COLORS[inq.status]}>
                          {inq.status.toLowerCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs mb-2" style={{ color: '#7f8c8d' }}>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />{inq.email}
                        </span>
                        {inq.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />{inq.phone}
                          </span>
                        )}
                      </div>
                      {inq.property && (
                        <p className="text-xs font-medium mb-2" style={{ color: '#3498db' }}>
                          Re: {inq.property.title}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed" style={{ color: '#5d6d7e' }}>
                        {inq.message}
                      </p>
                      <p className="text-xs mt-2" style={{ color: '#aab7b8' }}>
                        {formatDate(inq.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {inq.status === 'NEW' && (
                      <button
                        className="btn btn-sm flex items-center gap-1.5"
                        style={{ background: '#d5f5e3', color: '#1e8449', border: 'none' }}
                        onClick={() => updateStatus(inq.id, 'CONTACTED')}
                        disabled={updating === inq.id}>
                        {updating === inq.id
                          ? <span className="spinner" style={{ width: 14, height: 14 }} />
                          : <><CheckCircle className="w-3.5 h-3.5" />Mark contacted</>
                        }
                      </button>
                    )}
                    {inq.status === 'CONTACTED' && (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#f0f3f6', color: '#7f8c8d', border: 'none' }}
                        onClick={() => updateStatus(inq.id, 'CLOSED')}
                        disabled={updating === inq.id}>
                        {updating === inq.id
                          ? <span className="spinner" style={{ width: 14, height: 14 }} />
                          : 'Close inquiry'
                        }
                      </button>
                    )}
                    {inq.status === 'CLOSED' && (
                      <span className="text-xs font-medium" style={{ color: '#aab7b8' }}>Resolved</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && !loading && (
          <div className="p-4" style={{ borderTop: '1px solid #f0f3f6' }}>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
