'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import { propertyApi, getErrorMessage } from '@/lib/api';
import { Property } from '@/types';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED'];
const TYPE_OPTIONS   = ['HOUSE', 'APARTMENT', 'CONDO', 'LAND', 'COMMERCIAL'];

interface Props { property?: Property; }

export default function PropertyForm({ property }: Props) {
  const router  = useRouter();
  const isEdit  = !!property;
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title:       property?.title       || '',
    description: property?.description || '',
    price:       property?.price       || 0,
    status:      property?.status      || 'FOR_SALE',
    type:        property?.type        || 'APARTMENT',
    address:     property?.address     || '',
    city:        property?.city        || '',
    state:       property?.state       || '',
    zipCode:     property?.zipCode     || '',
    country:     property?.country     || 'Tunisia',
    bedrooms:    property?.bedrooms    || 1,
    bathrooms:   property?.bathrooms   || 1,
    area:        property?.area        || 50,
    yearBuilt:   property?.yearBuilt   || new Date().getFullYear(),
    featured:    property?.featured    || false,
    images:      property?.images.map((i) => i.url).join('\n') || '',
  });

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.price <= 0)          e.price       = 'Price must be positive';
    if (!form.address.trim())     e.address     = 'Address is required';
    if (!form.city.trim())        e.city        = 'City is required';
    if (!form.state.trim())       e.state       = 'State is required';
    if (!form.zipCode.trim())     e.zipCode     = 'Zip code is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const images = form.images
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const payload = {
      title:       form.title,
      description: form.description,
      price:       Number(form.price),
      status:      form.status,
      type:        form.type,
      address:     form.address,
      city:        form.city,
      state:       form.state,
      zipCode:     form.zipCode,
      country:     form.country,
      bedrooms:    Number(form.bedrooms),
      bathrooms:   Number(form.bathrooms),
      area:        Number(form.area),
      yearBuilt:   Number(form.yearBuilt),
      featured:    form.featured,
      images,
    };

    try {
      if (isEdit && property) {
        await propertyApi.update(property.id, payload);
        toast.success('Property updated');
      } else {
        await propertyApi.create(payload);
        toast.success('Property created');
      }
      router.push('/dashboard/properties');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', required = false, children }: {
    label: string; name: string; type?: string; required?: boolean; children?: React.ReactNode;
  }) => (
    <div>
      <label className={'label' + (required ? ' label-required' : '')}>{label}</label>
      {children}
      {errors[name] && <p className="error-msg">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="flex items-center gap-4">
        <button type="button" className="btn btn-secondary btn-sm flex items-center gap-2"
          onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />Back
        </button>
        <h2 className="text-xl font-bold" style={{ color: '#2c3e50' }}>
          {isEdit ? 'Edit property' : 'Add new property'}
        </h2>
        <button type="submit" className="btn btn-primary btn-sm flex items-center gap-2 ml-auto" disabled={loading}>
          {loading
            ? <span className="spinner" style={{ width: 16, height: 16 }} />
            : <><Save className="w-4 h-4" />{isEdit ? 'Save changes' : 'Create listing'}</>
          }
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: '#95a5a6' }}>Basic info</h3>

            <Field label="Title" name="title" required>
              <input type="text" className={'input ' + (errors.title ? 'input-error' : '')}
                placeholder="e.g. Luxury Villa with Sea View"
                value={form.title} onChange={(e) => set('title', e.target.value)} />
            </Field>

            <Field label="Description" name="description" required>
              <textarea rows={5} className={'input resize-none ' + (errors.description ? 'input-error' : '')}
                placeholder="Describe the property in detail..."
                value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label label-required">Status</label>
                <select className="input appearance-none" value={form.status}
                  onChange={(e) => set('status', e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label label-required">Type</label>
                <select className="input appearance-none" value={form.type}
                  onChange={(e) => set('type', e.target.value)}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: '#95a5a6' }}>Location</h3>

            <Field label="Address" name="address" required>
              <input type="text" className={'input ' + (errors.address ? 'input-error' : '')}
                placeholder="Street address"
                value={form.address} onChange={(e) => set('address', e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City" name="city" required>
                <input type="text" className={'input ' + (errors.city ? 'input-error' : '')}
                  placeholder="Tunis"
                  value={form.city} onChange={(e) => set('city', e.target.value)} />
              </Field>
              <Field label="State / Region" name="state" required>
                <input type="text" className={'input ' + (errors.state ? 'input-error' : '')}
                  placeholder="Tunis"
                  value={form.state} onChange={(e) => set('state', e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Zip code" name="zipCode" required>
                <input type="text" className={'input ' + (errors.zipCode ? 'input-error' : '')}
                  placeholder="1000"
                  value={form.zipCode} onChange={(e) => set('zipCode', e.target.value)} />
              </Field>
              <div>
                <label className="label">Country</label>
                <input type="text" className="input"
                  value={form.country} onChange={(e) => set('country', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: '#95a5a6' }}>Images</h3>
            <div>
              <label className="label">Image URLs <span className="font-normal" style={{ color: '#95a5a6' }}>(one per line)</span></label>
              <textarea rows={4} className="input resize-none font-mono text-sm"
                placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
                value={form.images} onChange={(e) => set('images', e.target.value)} />
              <p className="text-xs mt-1" style={{ color: '#95a5a6' }}>
                First image will be used as the thumbnail.
              </p>
            </div>
          </div>

        </div>

        {/* Side info */}
        <div className="space-y-5">

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: '#95a5a6' }}>Pricing</h3>
            <Field label="Price (TND)" name="price" required>
              <input type="number" className={'input ' + (errors.price ? 'input-error' : '')}
                min={0} value={form.price}
                onChange={(e) => set('price', e.target.value)} />
            </Field>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: '#95a5a6' }}>Details</h3>

            <div>
              <label className="label">Bedrooms</label>
              <input type="number" className="input" min={0} max={20}
                value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
            </div>
            <div>
              <label className="label">Bathrooms</label>
              <input type="number" className="input" min={0} max={20} step={0.5}
                value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
            </div>
            <div>
              <label className="label">Area (m²)</label>
              <input type="number" className="input" min={1}
                value={form.area} onChange={(e) => set('area', e.target.value)} />
            </div>
            <div>
              <label className="label">Year built</label>
              <input type="number" className="input" min={1800} max={new Date().getFullYear() + 1}
                value={form.yearBuilt} onChange={(e) => set('yearBuilt', e.target.value)} />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: '#95a5a6' }}>Options</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={form.featured}
                  onChange={(e) => set('featured', e.target.checked)} />
                <div className="w-10 h-6 rounded-full transition-colors"
                  style={{ background: form.featured ? '#3498db' : '#e0e6ed' }}>
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform"
                    style={{ left: form.featured ? '22px' : '4px' }} />
                </div>
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: '#2c3e50' }}>Featured listing</p>
                <p className="text-xs" style={{ color: '#95a5a6' }}>Show on homepage</p>
              </div>
            </label>
          </div>

        </div>
      </div>
    </form>
  );
}
