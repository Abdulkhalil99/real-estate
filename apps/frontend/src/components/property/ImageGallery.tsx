'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { PropertyImage } from '@/types';
import { getPrimaryImage } from '@/lib/utils';

export default function ImageGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [active,   setActive]   = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const all = images.length > 0
    ? images
    : [{ id: '0', url: getPrimaryImage([]), isPrimary: true, order: 0 }];

  const prev = () => setActive((i) => (i - 1 + all.length) % all.length);
  const next = () => setActive((i) => (i + 1) % all.length);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden">

        {/* Main image */}
        <div className="md:col-span-2 relative h-72 md:h-96 group cursor-pointer bg-gray-100"
          onClick={() => setLightbox(true)}>
          <Image src={all[active].url} alt={title} fill className="object-cover"
            priority sizes="(max-width: 768px) 100vw, 66vw" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
              <Expand className="w-5 h-5 text-gray-700" />
            </div>
          </div>
          {all.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-md hover:bg-white transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-md hover:bg-white transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            {active + 1} / {all.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="hidden md:flex flex-col gap-3">
          {all.slice(0, 3).map((img, i) => (
            <div key={img.id}
              className="relative flex-1 cursor-pointer rounded-xl overflow-hidden border-2 transition-all"
              style={{ borderColor: i === active ? '#3498db' : 'transparent' }}
              onClick={() => setActive(i)}>
              <Image src={img.url} alt={title + ' ' + (i + 1)} fill className="object-cover" sizes="20vw" />
              {i === 2 && all.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                  +{all.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
            onClick={() => setLightbox(false)}>
            <X className="w-6 h-6" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
            onClick={(e) => { e.stopPropagation(); prev(); }}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image src={all[active].url} alt={title} fill className="object-contain" sizes="100vw" />
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
            onClick={(e) => { e.stopPropagation(); next(); }}>
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-lg overflow-x-auto pb-1">
            {all.map((img, i) => (
              <div key={img.id}
                className="relative w-14 h-10 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all"
                style={{ borderColor: i === active ? 'white' : 'rgba(255,255,255,0.3)' }}
                onClick={(e) => { e.stopPropagation(); setActive(i); }}>
                <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
