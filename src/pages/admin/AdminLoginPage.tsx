import React, { useState } from 'react';
import { Shield, KeyRound, ArrowRight, User, Eye, EyeOff } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (route: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!adminUsername || !adminPassword) {
      setError('Please provide both username and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid admin credentials.');
        setIsSubmitting(false);
        return;
      }
      // Store admin user in localStorage (same key as normal users)
      localStorage.setItem('OHCEA_user', JSON.stringify(data.user));
      localStorage.setItem('OHCEA_token', data.token);
      // Force page reload so AuthContext picks up the new user
      window.location.href = '/admin/dashboard';
    } catch {
      setError('Network error. Please try again.');
    }
    setIsSubmitting(false);
  };

  const inputClass = "w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none bg-white";

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-[#003366] border-2 border-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Shield className="w-8 h-8 text-amber-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Console Portal</h1>
        <p className="text-xs text-slate-600">Restricted Access • Authorised Personnel Only</p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-[#003366]/5 p-6 space-y-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#003366]"></div>
        
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Admin Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Enter admin username"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className={inputClass}
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className={`${inputClass} pr-10`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-2 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
      
      <div className="text-center text-[10px] text-slate-400 font-mono mt-8">
        OHCEA Admin Authentication Subsystem
      </div>
    </div>
  );
};
