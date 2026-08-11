import React from 'react';
import { AssociationSettings } from '../../types';
import { Shield, MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

interface FooterProps {
  settings?: AssociationSettings | null;
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-sm">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Col 1: About */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white uppercase text-sm leading-snug">
                HIGH COURT EMPLOYEES' ASSOCIATION
              </h3>
              <p className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase">ESTABLISHED 1978</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The recognized democratic staff organization safeguarding the welfare, rights, professional development, and mutual support of judicial administrative personnel.
          </p>
          <div className="text-[11px] text-amber-300/80 font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            Reg No: 1978/HC/042 | High Court Cadre Recognized
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 pb-1 border-b border-slate-800">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            {[
              { label: 'About Association', path: '/about' },
              { label: 'Office Bearers', path: '/office-bearers' },
              { label: 'Staff Welfare Fund', path: '/welfare' },
              { label: 'Notices & Circulars', path: '/notices' },
              { label: 'Events & Seminars', path: '/events' },
              { label: 'Photo Gallery', path: '/gallery' },
              { label: 'Member Registration', path: '/register' },
              { label: 'Verify Digital ID Card', path: '/verify' }
            ].map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => onNavigate(link.path)}
                  className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-amber-400 text-[10px]">›</span>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Contact Info */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 pb-1 border-b border-slate-800">
            Secretariat & Contact
          </h4>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{settings?.address || "High Court Complex, Block A - Executive Wing, Sector 1, Pin - 753002"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings?.phone || "+91 (0671) 230-4821"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings?.email || "contact@hcea.gov.in"}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{settings?.officeHours || "Mon - Sat: 9:30 AM to 5:30 PM"}</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Portals & Verification */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 pb-1 border-b border-slate-800">
            Member & Public Portals
          </h4>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Member Login Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={() => onNavigate('/verify')}
              className="w-full py-2.5 px-4 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Verify Member ID Card</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={() => onNavigate('/register')}
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer shadow-md"
            >
              <span>New Employee Membership</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-slate-900 border-t border-slate-800 py-4 px-4 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} High Court Employees' Association. All rights reserved.</p>
          <div className="flex gap-4 text-[11px] text-slate-400">
            <button onClick={() => onNavigate('/')} className="hover:text-amber-300">Privacy Policy</button>
            <button onClick={() => onNavigate('/')} className="hover:text-amber-300">Terms of Service</button>
            <button onClick={() => onNavigate('/contact')} className="hover:text-amber-300">Contact Admin</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
