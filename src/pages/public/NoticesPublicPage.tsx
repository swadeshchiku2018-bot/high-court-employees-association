import React, { useEffect, useState } from 'react';
import { Notice } from '../../types';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

export const NoticesPublicPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

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
          Public announcements, General Body Meeting notices, welfare circulars, and executive resolutions.
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
        {filteredNotices.map((n) => (
          <div
            key={n.id}
            onClick={() => setSelectedNotice(n)}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 hover:border-blue-900"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 uppercase text-[10px]">
                {n.category}
              </span>
              <div className="flex items-center gap-1 text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{n.date}</span>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-base hover:text-blue-900">{n.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{n.description}</p>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
              <span>Published by: <strong className="text-slate-800">{n.publishedBy}</strong></span>
              <span className="text-blue-900 font-bold hover:underline">Read Full Notice & Download PDF →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Notice Reader Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40">
                  {selectedNotice.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedNotice.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
              {selectedNotice.content}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Date: {selectedNotice.date}</span>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white font-bold rounded-xl text-xs hover:bg-blue-950 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Print Notice PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
