import React, { useState } from 'react';
import { ViewRoute, AdminUser } from '../types';
import { loginAdmin } from '../lib/api';
import { Lock, Mail, Eye, EyeOff, Feather, ArrowRight, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  navigate: (route: ViewRoute) => void;
  onLoginSuccess: (admin: AdminUser) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ navigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your admin email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await loginAdmin(email, password);
      onLoginSuccess(res.admin);
      navigate({ type: 'admin_dashboard' });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-page" className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#0D3B2E] text-[#E4CA7E] flex items-center justify-center mx-auto shadow-md">
            <Feather className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D3B2E]">
            Emioluwa's Desk
          </h2>
          <p className="font-serif italic text-sm text-[#786D5F]">
            Secure Writer Portal & Publishing Hub
          </p>
        </div>

        {/* Login Box */}
        <div className="paper-card p-8 sm:p-10 rounded-3xl border border-[#E0D5C1] shadow-md bg-[#FFFDF9] space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DA]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#C29B38]" />
              <span>Author Authentication</span>
            </div>
            <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E0D5C1] text-[#786D5F]">
              Restricted
            </span>
          </div>

          <p className="text-xs text-[#5C5449] bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DA] leading-relaxed">
            This workspace is reserved solely for the author. Public reader registration is permanently disabled.
          </p>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#0D3B2E] mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#786D5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lifeofgod2912@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0D3B2E] mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#786D5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#786D5F] hover:text-[#0D3B2E]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] font-semibold text-sm hover:bg-[#135241] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Admin Dashboard'}</span>
              <ArrowRight className="w-4 h-4 text-[#E4CA7E]" />
            </button>
          </form>

        </div>

        <div className="text-center">
          <button
            onClick={() => navigate({ type: 'home' })}
            className="text-xs text-[#786D5F] hover:text-[#0D3B2E] transition-colors"
          >
            ← Back to Public Website
          </button>
        </div>

      </div>
    </div>
  );
};
