import React, { useState, useEffect } from 'react';
import { Shield, Search, CheckCircle2, XCircle, QrCode, AlertCircle } from 'lucide-react';

interface VerifyPageProps {
  initialMemberId?: string;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ initialMemberId }) => {
  const [memberIdInput, setMemberIdInput] = useState(initialMemberId || '');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const performVerification = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/verify/member/${encodeURIComponent(idToVerify.trim())}`);
      if (!res.ok) {
        throw new Error("No active record found for this Membership ID.");
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialMemberId) {
      performVerification(initialMemberId);
    }
  }, [initialMemberId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(memberIdInput);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-widest text-blue-900 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          PUBLIC VERIFICATION SYSTEM
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Verify High Court Member Identity
        </h1>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Official verification interface for verifying High Court Employees' Association digital ID card credentials.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Enter Membership ID e.g. HCEA-2026-0008"
              value={memberIdInput}
              onChange={(e) => setMemberIdInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm"
          >
            {isLoading ? "Verifying..." : "Verify ID"}
          </button>
        </form>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 justify-center">
          <QrCode className="w-3.5 h-3.5 text-amber-600" />
          <span>You can also scan the QR code printed on the back of any physical or digital HCEA ID card.</span>
        </div>
      </div>

      {/* Error Output */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl shadow-sm text-center space-y-2">
          <XCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h3 className="font-bold text-base">Unverified / Record Not Found</h3>
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      )}

      {/* Verification Result Card */}
      {result && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-2xl overflow-hidden space-y-6">
          {/* Official Verification Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-amber-300" />
              <div>
                <h3 className="font-bold text-base uppercase tracking-wide text-amber-200">
                  VERIFIED HIGH COURT MEMBER
                </h3>
                <p className="text-xs text-emerald-100 font-mono">HIGH COURT EMPLOYEES' ASSOCIATION</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-full uppercase">
              {result.status}
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Member Photo */}
            <div className="md:col-span-4 flex flex-col items-center">
              <img
                src={result.avatarUrl}
                alt={result.name}
                className="w-28 h-32 rounded-xl object-cover border-2 border-amber-400 shadow-md"
              />
              <span className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                OFFICIAL PHOTOGRAPH
              </span>
            </div>

            {/* Member Public Info */}
            <div className="md:col-span-8 space-y-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Full Name</p>
                <p className="font-extrabold text-slate-900 text-lg">{result.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Membership ID</p>
                  <p className="font-mono font-bold text-blue-900 text-sm">{result.membershipId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Current Designation</p>
                  <p className="font-bold text-slate-800">{result.designation}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Department</p>
                  <p className="font-semibold text-slate-700">{result.department}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Membership Date</p>
                  <p className="font-semibold text-slate-700">{result.membershipDate}</p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                Verified by <strong className="text-slate-800">{result.verifiedBy || "High Court Association Secretariat"}</strong> on {result.verifiedAt || "Record Active"}.
              </div>
            </div>
          </div>

          {/* Privacy Notice Footer */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Data Privacy Notice: Confidential details (personal phone number, residential address, bank accounts, and uploaded documents) are withheld on public verification pages.</span>
          </div>
        </div>
      )}
    </div>
  );
};
