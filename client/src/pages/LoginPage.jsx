import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-10 h-10 rounded-xl bg-brand text-white items-center justify-center font-bold text-base mb-3 shadow-md">
            N
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Welcome back</h1>
          <p className="text-sub text-xs mt-1">Sign in to your NotifyHub developer account</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xl">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl border border-bad/30 bg-bad/10 text-bad text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-sub block mb-1.5">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="developer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus:border-brand focus:outline-none transition-colors"
                  required
                />
                <Mail className="w-4 h-4 text-mute absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-sub">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus:border-brand focus:outline-none transition-colors"
                  required
                />
                <Lock className="w-4 h-4 text-mute absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-mute hover:text-ink cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-brand text-white font-medium text-sm hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer mt-2 shadow-sm active:scale-95"
            >
              {submitting ? 'Signing in...' : 'Sign in to account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-sub mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand font-medium hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
