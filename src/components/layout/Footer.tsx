import React, { useState, useEffect } from 'react';
import { AssociationSettings } from '../../types';
import { Shield, MapPin, Phone, Mail, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  settings?: AssociationSettings | null;
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings: initialSettings, onNavigate }) => {
  const [settings, setSettings] = useState<AssociationSettings | null>(initialSettings || null);

  useEffect(() => {
    if (!settings) {
      fetch('/api/settings')
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setSettings(data); })
        .catch(() => {});
    }
  }, [settings]);

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-sm">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Col 1: Identity & Charter (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-xs">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm tracking-tight leading-snug uppercase">
                  HIGH COURT OF ORISSA EMPLOYEES' ASSOCIATION
                </h3>
                <p className="text-[10px] text-amber-400/90 font-semibold tracking-wider uppercase mt-0.5">
                  ESTD. 1978 • REGD. NO. 1948/OHCEA
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed text-justify">
              The officially recognized democratic staff organization safeguarding the welfare, institutional rights, career advancement, and camaraderie of administrative & judicial cadre personnel of the High Court of Orissa.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Registered under Societies Regn. Act XXI of 1860</span>
            </div>
          </div>

          {/* Col 2: Navigation (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 pb-2 border-b border-slate-800/80">
              Association
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Office Bearers', path: '/office-bearers' },
                { label: 'Activities & Events', path: '/events' },
                { label: 'Photo Gallery', path: '/gallery' },
                { label: 'Contact Secretariat', path: '/contact' }
              ].map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => onNavigate(link.path)}
                    className="group hover:text-white text-slate-400 transition-colors cursor-pointer flex items-center gap-1.5 py-0.5 text-left w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-amber-400/70 group-hover:translate-x-0.5 group-hover:text-amber-300 transition-all shrink-0" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Staff Welfare & Circulars (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 pb-2 border-b border-slate-800/80">
              Welfare & Circulars
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'Staff Welfare Fund Schemes', path: '/welfare' },
                { label: 'Official Circulars & Notices', path: '/notices' },
                { label: 'Verify Digital ID Card', path: '/verify' },
                { label: 'New Member Registration', path: '/register' },
                { label: 'Member Login Portal', path: '/login' }
              ].map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => onNavigate(link.path)}
                    className="group hover:text-white text-slate-400 transition-colors cursor-pointer flex items-center gap-1.5 py-0.5 text-left w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-amber-400/70 group-hover:translate-x-0.5 group-hover:text-amber-300 transition-all shrink-0" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Secretariat & Contact (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 pb-2 border-b border-slate-800/80">
              Secretariat Office
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {settings?.address || "High Court of Orissa, Chandni Chowk, Cuttack – 753002, Odisha"}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{settings?.phone || "+91 (0671) 230-4821"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="break-all">{settings?.email || "contact@OHCEA.gov.in"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {settings?.officeHours || "Mon – Sat: 9:30 AM to 5:30 PM (Court Working Days)"}
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Copyright & Legal Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800 py-4 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} High Court of Orissa Employees' Association. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-slate-400">
            <button onClick={() => onNavigate('/about')} className="hover:text-amber-300 transition-colors cursor-pointer">
              About
            </button>
            <span className="text-slate-700">•</span>
            <button onClick={() => onNavigate('/notices')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Circulars
            </button>
            <span className="text-slate-700">•</span>
            <button onClick={() => onNavigate('/contact')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Contact Secretariat
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
