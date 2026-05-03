'use client';
import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { inquiryApi, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

export default function InquiryForm({ propertyId }: { propertyId: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 10) e.message = 'Message too short';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await inquiryApi.create({ ...form, propertyId });
      setSubmitted(true);
      toast.success('Inquiry sent!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: '#d5f5e3' }}>
          <CheckCircle className="w-7 h-7" style={{ color: '#1e8449' }} />
        </div>
        <h3 className="font-bold mb-1" style={{ color: '#2c3e50' }}>Inquiry sent!</h3>
        <p className="text-sm" style={{ color: '#7f8c8d' }}>The agent will contact you within 24 hours.</p>
        <button className="btn btn-secondary btn-sm mt-4" onClick={() => setSubmitted(false)}>Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">Full name <span style={{ color: '#e74c3c' }}>*</span></label>
        <input type="text" className={'input ' + (errors.name ? 'input-error' : '')}
          placeholder="Your full name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {errors.name && <p className="error-msg">{errors.name}</p>}
      </div>
      <div>
        <label className="label">Email <span style={{ color: '#e74c3c' }}>*</span></label>
        <input type="email" className={'input ' + (errors.email ? 'input-error' : '')}
          placeholder="your@email.com" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email && <p className="error-msg">{errors.email}</p>}
      </div>
      <div>
        <label className="label">Phone <span className="font-normal" style={{ color: '#95a5a6' }}>(optional)</span></label>
        <input type="tel" className="input" placeholder="+216 XX XXX XXX" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label className="label">Message <span style={{ color: '#e74c3c' }}>*</span></label>
        <textarea rows={4} className={'input resize-none ' + (errors.message ? 'input-error' : '')}
          placeholder="I am interested in this property..."
          value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {errors.message && <p className="error-msg">{errors.message}</p>}
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading
          ? <span className="spinner" style={{ width: 18, height: 18 }} />
          : <><Send className="w-4 h-4" />Send inquiry</>
        }
      </button>
      <p className="text-xs text-center" style={{ color: '#95a5a6' }}>
        Your details are only shared with the listing agent.
      </p>
    </form>
  );
}
