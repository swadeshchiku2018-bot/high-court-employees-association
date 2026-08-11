import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, KeyRound, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Please provide both email and password.");
      setIsSubmitting(false);
      return;
    }

    const user = await login(email, password);
    setIsSubmitting(false);

    if (user) {
      if (user.role === 'ADMIN' || user.role === 'EXECUTIVE') {
        onNavigate('/admin/dashboard');
      } else {
        onNavigate('/member/dashboard');
      }
    } else {
      setError("Invalid credentials or email not registered.");
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setIsSubmitting(true);
    const user = await login(demoEmail);
    setIsSubmitting(false);
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'EXECUTIVE') {
        onNavigate('/admin/dashboard');
      } else {
        onNavigate('/member/dashboard');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-blue-900 border-2 border-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Shield className="w-8 h-8 text-amber-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Member Login Portal</h1>
        <p className="text-xs text-slate-600">High Court Employees' Association Secure Access</p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Registered Email or Membership ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. president@hcea.gov.in or HCEA-2026-0001"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => alert("Password reset link sent to official High Court email.")}
                className="text-amber-800 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            <span>Sign In to Member Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Accounts Quick Login */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <p className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Quick Demo Persona Login (1-Click):
          </p>
          <div className="space-y-2 text-xs">
            {[
              { role: "President (Admin)", email: "president@hcea.gov.in" },
              { role: "General Secretary", email: "secretary@hcea.gov.in" },
              { role: "Treasurer", email: "treasurer@hcea.gov.in" },
              { role: "Active Member (Sanjib Rout)", email: "member@hcea.gov.in" },
              { role: "Pending Member", email: "pending1@hcea.gov.in" }
            ].map((p) => (
              <button
                key={p.email}
                onClick={() => handleQuickDemo(p.email)}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer text-slate-800 font-semibold"
              >
                <span>{p.role}</span>
                <span className="text-[10px] text-blue-900 font-mono">{p.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
