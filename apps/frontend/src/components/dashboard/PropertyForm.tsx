'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import { propertyApi, getErrorMessage } from '@/lib/api';
import { Property } from '@/types';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED'];
const TYPE_OPTIONS   = ['HOUSE', 'APARTMENT', 'CONDO', 'LAND', 'COMMERCIAL'];

// ─── Field wrapper — defined OUTSIDE PropertyForm so it never remounts ────────
// This is the root cause of the focus bug.
// If Field is defined inside PropertyForm, React creates a new component
// type on every render, unmounts the old input, mounts a new one → focus lost.
function Field({
  label, error, required, children,
}: {
  label:    string;
  error?:   string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={'label' + (required ? ' label-required' : '')}>
        {label}
      </label>
      {children}
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────
interface Props { property?: Property; }

export default function PropertyForm({ property }: Props) {
  const router = useRouter();
  const isEdit = !!property;

  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const [title,       setTitle]       = useState(property?.title       || '');
  const [description, setDescription] = useState(property?.description || '');
  const [price,       setPrice]       = useState(String(property?.price     || 0));
  const [status,      setStatus]      = useState(property?.status      || 'FOR_SALE');
  const [type,        setType]        = useState(property?.type        || 'APARTMENT');
  const [address,     setAddress]     = useState(property?.address     || '');
  const [city,        setCity]        = useState(property?.city        || '');
  const [state,       setState]       = useState(property?.state       || '');
  const [zipCode,     setZipCode]     = useState(property?.zipCode     || '');
  const [country,     setCountry]     = useState(property?.country     || 'Tunisia');
  const [bedrooms,    setBedrooms]    = useState(String(property?.bedrooms  || 1));
  const [bathrooms,   setBathrooms]   = useState(String(property?.bathrooms || 1));
  const [area,        setArea]        = useState(String(property?.area      || 50));
  const [yearBuilt,   setYearBuilt]   = useState(String(property?.yearBuilt || new Date().getFullYear()));
  const [featured,    setFeatured]    = useState(property?.featured    || false);
  const [images,      setImages]      = useState(
    property?.images.map((i) => i.url).join('\n') || ''
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())       e.title       = 'Title is required';
    if (!description.trim()) e.description = 'Description is required';
    if (Number(price) <= 0)  e.price       = 'Price must be positive';
    if (!address.trim())     e.address     = 'Address is required';
    if (!city.trim())        e.city        = 'City is required';
    if (!state.trim())       e.state       = 'State is required';
    if (!zipCode.trim())     e.zipCode     = 'Zip code is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const imageUrls = images
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const payload = {
      title,
      description,
      price:     Number(price),
      status,
      type,
      address,
      city,
      state,
      zipCode,
      country,
      bedrooms:  Number(bedrooms),
      bathrooms: Number(bathrooms),
      area:      Number(area),
      yearBuilt: Number(yearBuilt),
      featured,
      images:    imageUrls,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button type="button"
          className="btn btn-secondary btn-sm flex items-center gap-2"
          onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h2 className="text-xl font-bold" style={{ color: '#2c3e50' }}>
          {isEdit ? 'Edit property' : 'Add new property'}
        </h2>

        <button type="submit"
          className="btn btn-primary btn-sm flex items-center gap-2 ml-auto"
          disabled={loading}>
          {loading
            ? <span className="spinner" style={{ width: 16, height: 16 }} />
            : <><Save className="w-4 h-4" />{isEdit ? 'Save changes' : 'Create listing'}</>
          }
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic info */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide"
              style={{ color: '#95a5a6' }}>
              Basic info
            </h3>

            <Field label="Title" error={errors.title} required>
              <input
                type="text"
                className={'input ' + (errors.title ? 'input-error' : '')}
                placeholder="e.g. Luxury Villa with Sea View"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>

            <Field label="Description" error={errors.description} required>
              <textarea
                rows={5}
                className={'input resize-none ' + (errors.description ? 'input-error' : '')}
                placeholder="Describe the property in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Status" required>
                <select
                  className="input appearance-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </Field>

              <Field label="Type" required>
                <select
                  className="input appearance-none"
                  value={type}
                  onChange={(e) => setType(e.target.value)}>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Location */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide"
              style={{ color: '#95a5a6' }}>
              Location
            </h3>

            <Field label="Address" error={errors.address} required>
              <input
                type="text"
                className={'input ' + (errors.address ? 'input-error' : '')}
                placeholder="Street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City" error={errors.city} required>
                <input
                  type="text"
                  className={'input ' + (errors.city ? 'input-error' : '')}
                  placeholder="Tunis"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </Field>

              <Field label="State / Region" error={errors.state} required>
                <input
                  type="text"
                  className={'input ' + (errors.state ? 'input-error' : '')}
                  placeholder="Tunis"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Zip code" error={errors.zipCode} required>
                <input
                  type="text"
                  className={'input ' + (errors.zipCode ? 'input-error' : '')}
                  placeholder="1000"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </Field>

              <Field label="Country">
                <input
                  type="text"
                  className="input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide"
              style={{ color: '#95a5a6' }}>
              Images
            </h3>

            <Field label="Image URLs (one per line)">
              <textarea
                rows={4}
                className="input resize-none font-mono text-sm"
                placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
                value={images}
                onChange={(e) => setImages(e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: '#95a5a6' }}>
                First image will be used as the thumbnail.
              </p>
            </Field>
          </div>

        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Pricing */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide"
              style={{ color: '#95a5a6' }}>
              Pricing
            </h3>

            <Field label="Price (TND)" error={errors.price} required>
              <input
                type="number"
                className={'input ' + (errors.price ? 'input-error' : '')}
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
          </div>

          {/* Details */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide"
              style={{ color: '#95a5a6' }}>
              Details
            </h3>

            <Field label="Bedrooms">
              <input
                type="number"
                className="input"
                min={0} max={20}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              />
            </Field>

            <Field label="Bathrooms">
              <input
                type="number"
                className="input"
                min={0} max={20} step={0.5}
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
              />
            </Field>

            <Field label="Area (m²)">
              <input
                type="number"
                className="input"
                min={1}
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </Field>

            <Field label="Year built">
              <input
                type="number"
                className="input"
                min={1800}
                max={new Date().getFullYear() + 1}
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
              />
            </Field>
          </div>

          {/* Options */}
          <div className="card p-6">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-4"
              style={{ color: '#95a5a6' }}>
              Options
            </h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <div
                  className="w-10 h-6 rounded-full transition-colors"
                  style={{ background: featured ? '#3498db' : '#e0e6ed' }}
                />
                <div
                  className="w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-all"
                  style={{ left: featured ? '22px' : '4px' }}
                />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: '#2c3e50' }}>
                  Featured listing
                </p>
                <p className="text-xs" style={{ color: '#95a5a6' }}>
                  Show on homepage
                </p>
              </div>
            </label>
          </div>

        </div>
      </div>
    </form>
  );
}
