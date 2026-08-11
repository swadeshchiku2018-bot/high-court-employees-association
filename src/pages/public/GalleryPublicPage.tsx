import React, { useEffect, useState } from 'react';
import { GalleryItem } from '../../types';

export const GalleryPublicPage: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/gallery').then(res => res.json()).then(setGallery).catch(console.error);
  }, []);

  const filtered = activeCategory === 'ALL'
    ? gallery
    : gallery.filter(g => g.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 text-slate-800">
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-widest text-blue-900 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          PHOTO ARCHIVE & GALLERY
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Association Events & Activities Gallery
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          Visual documentation of judicial staff conferences, sports days, health checkup camps, and award ceremonies.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center text-xs">
        {['ALL', 'WELFARE', 'EVENTS', 'MEETINGS', 'SOCIAL'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md group">
            <div className="relative h-56 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
                {item.category}
              </span>
            </div>
            <div className="p-4 space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
              <p className="text-[10px] text-slate-400 font-mono pt-1">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
