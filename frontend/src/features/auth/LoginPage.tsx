import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { Mail, ArrowRight, Lock, User as UserIcon, CheckCircle2, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await api.auth.signup(email, password, name);
      } else {
        await api.auth.login(email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('demo@reachinbox.ai');
    setPassword('demo123456');
    setName('Ayush Ranjan');
  };

  return (
    <div className="min-h-screen hero-sunset-gradient flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#fffdfa] border border-[#ede5d8] rounded-3xl p-8 shadow-2xl relative z-10 text-[#1c1917]">
        {/* Branding Emblem */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-600/30 mb-3 text-white">
            <span className="font-bold text-sm tracking-tight">RI</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1c1917]">ReachInbox Scheduler</h1>
          <p className="text-xs text-[#78716c] mt-1">
            {isSignUp ? 'Create your account to start scheduling' : 'Sign in to access your queue dashboard'}
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="grid grid-cols-2 p-1 bg-[#f5f0e8] border border-[#e2d8c9] rounded-xl mb-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`py-2 rounded-lg transition ${
              !isSignUp ? 'bg-orange-600 text-white font-semibold shadow-sm' : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`py-2 rounded-lg transition ${
              isSignUp ? 'bg-orange-600 text-white font-semibold shadow-sm' : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-[#44403c] mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#a8a29e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ayush Ranjan"
                  className="w-full bg-[#faf8f5] border border-[#e2d8c9] focus:border-orange-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#1c1917] placeholder-[#a8a29e] outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#44403c] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#a8a29e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#faf8f5] border border-[#e2d8c9] focus:border-orange-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#1c1917] placeholder-[#a8a29e] outline-none transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#44403c] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#a8a29e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#faf8f5] border border-[#e2d8c9] focus:border-orange-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#1c1917] placeholder-[#a8a29e] outline-none transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-lg shadow-orange-600/30 transition disabled:opacity-50 mt-2 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? (
              'Authenticating...'
            ) : isSignUp ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Create Account
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Demo Login Quick Fill */}
        <div className="mt-4 pt-4 border-t border-[#ede5d8] flex items-center justify-between text-[11px]">
          <span className="text-[#a8a29e]">Need quick test credentials?</span>
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="text-orange-700 hover:text-orange-800 font-semibold flex items-center gap-1 transition"
          >
            <Sparkles className="w-3 h-3" /> Auto-fill Demo
          </button>
        </div>

        {onBackToLanding && (
          <div className="mt-4 pt-3 border-t border-[#ede5d8] text-center">
            <button
              type="button"
              onClick={onBackToLanding}
              className="text-xs text-[#78716c] hover:text-[#1c1917] transition"
            >
              &larr; Back to Product Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
