import React, { useEffect, useState } from 'react';
import { OfficeBearer } from '../../types';
import { Mail, Phone, Calendar, Shield } from 'lucide-react';

export const OfficeBearersPage: React.FC = () => {
  const [officeBearers, setOfficeBearers] = useState<OfficeBearer[]>([]);

  useEffect(() => {
    fetch('/api/office-bearers')
      .then(res => res.json())
      .then(setOfficeBearers)
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 text-slate-800">
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-widest text-blue-900 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          EXECUTIVE COUNCIL
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Association Office Bearers (2024 - 2026)
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          Elected leadership representing High Court Employees' Association interests before the Honorable Registry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {officeBearers.map((ob) => (
          <div
            key={ob.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col justify-between hover:border-blue-900 transition-all"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={ob.photo}
                  alt={ob.name}
                  className="w-20 h-24 rounded-xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
                />
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-amber-300 uppercase">
                    {ob.designation}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{ob.name}</h3>
                  <p className="text-xs font-semibold text-slate-500">{ob.courtRole}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic border-t border-slate-100 pt-3">
                "{ob.shortBio}"
              </p>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs space-y-1 text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span>{ob.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span className="truncate">{ob.email}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-amber-900">
                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Elected Term: {ob.term}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
