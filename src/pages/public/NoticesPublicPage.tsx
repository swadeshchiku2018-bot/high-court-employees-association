import React, { useEffect, useState } from 'react';
import { Notice } from '../../types';
import { FileText, Download, Filter, Calendar, ExternalLink } from 'lucide-react';

interface NoticesPublicPageProps {
  onNavigate?: (route: string) => void;
}

export const NoticesPublicPage: React.FC<NoticesPublicPageProps> = ({ onNavigate }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/notices?visibility=PUBLIC')
      .then(res => res.json())
      .then(setNotices)
      .catch(console.error);
  }, []);

  const filteredNotices = selectedCategory === 'ALL'
    ? notices
    : notices.filter(n => n.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 text-slate-800">
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-widest text-blue-900 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          OFFICIAL CIRCULARS & NOTICES
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Association Notices & Communications
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          Public announcements, General Body Meeting notices, welfare circulars, and executive resolutions. Click any notice to open the official PDF circular directly in a new tab.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center text-xs">
        {['ALL', 'CIRCULAR', 'GENERAL', 'WELFARE', 'EVENT'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((n) => {
          const pdfUrl = n.attachmentUrl ? `/api/notices/${n.id}/pdf` : `/notice/${n.id}`;
          return (
            <a
              key={n.id}
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all cursor-pointer space-y-3 hover:border-blue-900 hover:-translate-y-0.5"
              title="Click to open official PDF in a new tab"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 uppercase text-[10px]">
                    {n.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{n.date}</span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4">
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-900 transition-colors">
                  {n.title}
                </h3>
                <div className="p-2 bg-blue-50 group-hover:bg-blue-900 text-blue-900 group-hover:text-amber-400 rounded-xl transition-all shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{n.description}</p>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                <span>Published by: <strong className="text-slate-800">{n.publishedBy}</strong></span>
                <span className="text-blue-900 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                  <span>Open PDF in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
