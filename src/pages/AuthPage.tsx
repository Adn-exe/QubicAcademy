// ============================================================
// QuantumLearn AI — Authentication Page & Flow
// Clean Email/Password Authentication & Instant Provisioning
// ============================================================

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import {
  Atom,
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect to destination or /profile
  React.useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(cleanEmail, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Signed in successfully! Redirecting...');
          setTimeout(() => {
            const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/profile';
            navigate(from, { replace: true });
          }, 300);
        }
      } else {
        const { error } = await signUp(cleanEmail, password, name.trim() || undefined);
        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            setErrorMsg('This email is already registered. Please sign in below.');
            setMode('signin');
          } else {
            setErrorMsg(error.message);
          }
        } else {
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => {
            const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/profile';
            navigate(from, { replace: true });
          }, 300);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected authentication error occurred.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[var(--void)] relative selection:bg-[var(--signal-cyan)]/20">
      {/* Top back navigation button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[var(--ink)] transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.05] cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Qubiq Academy</span>
        </button>
      </div>

      {/* Background ambient quantum glow */}
      <div className="relative w-full max-w-md">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-[var(--signal-cyan)] opacity-[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[var(--cryostat-gold)] opacity-[0.08] rounded-full blur-3xl pointer-events-none" />

        {/* Card Container */}
        <div className="relative rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)]/95 backdrop-blur-2xl p-7 sm:p-8 shadow-2xl transition-all duration-300">
          
          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[var(--signal-cyan)]/20 to-[var(--cryostat-gold)]/20 border border-[var(--signal-cyan)]/30 mb-4 shadow-inner">
              <Atom className="w-6 h-6 text-[var(--signal-cyan)] animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)] font-heading">
              {mode === 'signin' ? 'Sign In to Qubiq' : 'Create an Account'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
              {mode === 'signin'
                ? 'Sign in to access your circuits, problem streaks, and cloud sync.'
                : 'Join Qubiq Academy to simulate circuits and master algorithms.'}
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-[var(--void)] border border-[var(--panel-border)]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[var(--panel)] text-[var(--signal-cyan)] shadow-xs border border-white/10'
                  : 'text-[var(--text-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[var(--panel)] text-[var(--signal-cyan)] shadow-xs border border-white/10'
                  : 'text-[var(--text-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--void)] border border-[var(--panel-border)] rounded-xl text-sm text-[var(--ink)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--signal-cyan)] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--void)] border border-[var(--panel-border)] rounded-xl text-sm text-[var(--ink)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--signal-cyan)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[var(--void)] border border-[var(--panel-border)] rounded-xl text-sm text-[var(--ink)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--signal-cyan)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors p-1 cursor-pointer focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
                  Must be at least 6 characters.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--signal-cyan)] to-[var(--signal-cyan)]/80 hover:opacity-90 text-[var(--void)] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[var(--signal-cyan)]/15"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign in & Sign up */}
          <div className="mt-6 pt-5 border-t border-[var(--panel-border)] text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              {mode === 'signin' ? "Don't have an account yet?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-semibold text-[var(--signal-cyan)] hover:underline ml-1 cursor-pointer"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

        </div>

        {/* Footer info */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]/70">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--cryostat-gold)]" />
            <span>Encrypted cloud sync & real-time state persistence</span>
          </div>
        </div>

      </div>
    </div>
  );
};
