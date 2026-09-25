import React from 'react';
import { HeartHandshake, ShieldCheck, Award, FileText, CheckCircle2 } from 'lucide-react';

interface WelfarePublicPageProps {
  onNavigate: (route: string) => void;
}

export const WelfarePublicPage: React.FC<WelfarePublicPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10 text-slate-800">
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-widest text-emerald-800 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          EMPLOYEE WELFARE CORPUS FUND
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Comprehensive Member Welfare Initiatives
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          High Court Employees' Association provides immediate financial assistance, medical relief, and educational grants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Emergency Medical Grant",
            limit: "Up to ₹1,00,000",
            desc: "Immediate cashless or 24-hour sanctioned grant for cardiac, oncology, organ transplant, or accidental surgery."
          },
          {
            title: "Children Higher Education Award",
            limit: "Up to ₹25,000 / Year",
            desc: "Annual scholarship incentive for employee children admitted to IIT, NIT, AIIMS, NLU, or State Universities."
          },
          {
            title: "Bereavement & Retirement Corpus",
            limit: "₹50,000 Ex-Gratia",
            desc: "Instant bereavement support to family dependents or honorific farewell purse upon superannuation."
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
            <p className="text-sm font-extrabold text-blue-900 font-mono">{item.limit}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-amber-300">Are you an Active Member needing Welfare Assistance?</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Log in to the Member Portal to submit online welfare applications along with supporting hospital bills or fee receipts for 24-48 hour approval.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/login')}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl shadow-md transition-all cursor-pointer text-xs shrink-0"
        >
          Apply via Member Portal
        </button>
      </div>
    </div>
  );
};
