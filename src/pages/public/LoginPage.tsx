import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, KeyRound, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please provide both your login ID and password.');
      return;
    }
    setIsSubmitting(true);
    const user = await login(identifier, password);
    setIsSubmitting(false);
    if (user) {
      onNavigate('/member/dashboard');
    } else {
      setError('Invalid credentials. Please check your HRMS ID, email, or membership ID and password.');
    }
  };

  const inputClass = "w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none";

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-blue-900 border-2 border-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Shield className="w-8 h-8 text-amber-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Member Login</h1>
        <p className="text-xs text-slate-600">Orissa High Court Employees' Association</p>
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
            <label className="block font-bold text-slate-700 mb-1">HRMS ID / Email / Membership ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. HRMS-10821 or your email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <p className="text-[10px] text-slate-400 mt-1">Default password for new accounts: <code className="font-bold text-slate-600">ohcea123</code></p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In to Member Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="text-center">
            <span className="text-xs text-slate-500">Not a member yet? </span>
            <button type="button" onClick={() => onNavigate('/register')} className="text-xs font-bold text-blue-900 hover:underline">Apply for Membership</button>
          </div>
        </form>
      </div>
    </div>
  );
};
