import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminLoginModal } from '../components/auth/AdminLoginModal';
import {
  Shield,
  GraduationCap,
  LogIn,
  UserPlus,
  ArrowRight,
  Mail,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, loginStudent, logout, isAdmin } = useAuth();

  // Admin Modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Auth Card Tab: 'signin' | 'signup'
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Handle Sign In / Create Account
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authTab === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/route');
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      navigate('/route');
    } catch (err: any) {
      setAuthError(err?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick Student Continue
  const handleStudentContinue = () => {
    loginStudent('Student User', 'student@saveetha.ac.in');
    navigate('/route');
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* 1. TOP HEADER - ADMIN LOGIN ONLY AT TOP RIGHT */}
      <header className="sticky top-0 z-40 w-full bg-[#0d1522]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="SEC Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-amber-500/50 shadow-md shadow-amber-500/20"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
                SEC வரைபடம்
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[8.5px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded font-bold">
                VARAIPADAM
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Saveetha Engineering College • Smart Campus Indoor Navigation
            </p>
          </div>
        </div>

        {/* Top Right: ADMIN LOGIN (Password only) */}
        <div>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-600/30 transition-all transform active:scale-95 border border-amber-400/40"
            title="Administrator Portal Login (Password required)"
          >
            <Shield className="w-4 h-4 fill-slate-950" />
            <span>Admin Login</span>
          </button>
        </div>
      </header>

      {/* 2. CENTERED AUTH CARD CONTAINER */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative backdrop-blur-md overflow-hidden animate-fadeIn">
          {/* Ambient gold background glow */}
          <div className="absolute -top-24 -right-24 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* College Logo Banner in Center */}
          <div className="text-center mb-6">
            <img
              src="/logo.png"
              alt="SEC Logo"
              className="w-16 h-16 rounded-full mx-auto mb-3 object-cover ring-4 ring-amber-500/40 shadow-xl shadow-amber-500/20"
            />
            <h1 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
              SEC வரைபடம்
            </h1>
            <p className="text-xs text-amber-300/80 font-mono mt-0.5">
              SAVEETHA ENGINEERING COLLEGE
            </p>
          </div>

          {/* Auth Tab Switcher: Sign In vs Create Account */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthTab('signin');
                setAuthError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authTab === 'signin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthTab('signup');
                setAuthError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authTab === 'signup'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Active user status banner if already signed in */}
          {user && (
            <div className="mb-4 p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-xs">
                  {user.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-amber-400" /> : <GraduationCap className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.displayName || user.email}</p>
                  <span className="text-[10px] font-mono text-blue-300 uppercase">{user.role} active</span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold underline"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Error Banner */}
          {authError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs animate-shake">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {authTab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student / Faculty Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@saveetha.ac.in"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition active:scale-[0.98] disabled:opacity-50"
            >
              {authLoading
                ? 'Verifying...'
                : authTab === 'signin'
                ? 'Sign In to Campus Map'
                : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-slate-800"></div>
            <span className="px-3 text-[10px] text-slate-500 uppercase font-mono tracking-wider">
              or continue with
            </span>
            <div className="flex-1 border-t border-slate-800"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-xl text-xs transition border border-slate-700 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Continue */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleStudentContinue}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 transition"
            >
              <span>Quick Student Entry</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </main>

      {/* ADMIN LOGIN MODAL (ASKING ONLY FOR PASSWORD) */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        redirectToAdmin={true}
      />
    </div>
  );
};

export default LandingPage;
