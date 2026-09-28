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
  Compass,
  Building,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, loginStudent, logout, isAdmin } = useAuth();

  // If already logged in, do not show login page - redirect straight to Route selection
  React.useEffect(() => {
    if (user) {
      navigate('/route', { replace: true });
    }
  }, [user, navigate]);

  // Admin Modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Auth Card Tab: 'signin' | 'signup'
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  if (user) {
    return null;
  }

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
    <div className="min-h-screen bg-[#f7f5ee] spaceplanner-grid-bg text-[#11202f] flex flex-col selection:bg-[#dbe4eb] selection:text-[#1e354d]">
      {/* 1. TOP HEADER (SPACEPLANNER THEME) */}
      <header className="sticky top-0 z-40 w-full bg-[#fcfaf6]/95 backdrop-blur-md border-b border-[#ded4c0] px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="SEC Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[#ded4c0] shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-black text-lg sm:text-xl tracking-tight text-[#11202f]">
                SEC வரைபடம்
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono uppercase bg-[#dbe4eb] text-[#1e354d] border border-[#cad7e2] rounded-full font-bold">
                SPACEPLANNER
              </span>
            </div>
            <p className="text-[11px] font-sans text-[#64748b]">
              Saveetha Engineering College • Auditorium Block
            </p>
          </div>
        </div>

        {/* Top Right: ADMIN LOGIN (Password only) */}
        <div>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl bg-[#1e354d] hover:bg-[#162a3f] text-white shadow-sm transition-all transform active:scale-95"
            title="Administrator Portal Login (Password required)"
          >
            <Shield className="w-4 h-4 fill-white text-[#1e354d]" />
            <span>Admin Login</span>
          </button>
        </div>
      </header>

      {/* 2. BREADCRUMB & HEADER TAG */}
      <div className="max-w-md mx-auto w-full px-4 pt-6 text-left">
        <div className="text-[12px] font-mono text-[#64748b] mb-2 flex items-center gap-1.5">
          <span>Home</span>
          <span>/</span>
          <span className="text-[#11202f] font-semibold">Auditorium Block Planner</span>
        </div>
        <div className="inline-block px-3 py-1 bg-[#dbe4eb] text-[#1e354d] text-[11px] font-mono font-bold uppercase rounded-lg border border-[#cad7e2] tracking-wider mb-2">
          PLANNERS
        </div>
      </div>

      {/* 3. CENTERED AUTH CARD (SPACEPLANNER THEME) */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md bg-white border border-[#ded4c0] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#11202f]/5 relative overflow-hidden animate-fadeIn">
          {/* Logo & Headline */}
          <div className="text-center mb-6">
            <img
              src="/logo.png"
              alt="SEC Logo"
              className="w-16 h-16 rounded-full mx-auto mb-3 object-cover ring-4 ring-[#f1ede4] shadow-md"
            />
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#11202f] tracking-tight">
              SEC வரைபடம்
            </h1>
            <p className="text-xs text-[#64748b] font-sans mt-1">
              Plan your route across Auditorium Block (Ground to 6th Floor)
            </p>
          </div>

          {/* Auth Tab Switcher: Sign In vs Create Account */}
          <div className="flex bg-[#f7f5ee] p-1.5 rounded-2xl border border-[#ded4c0] mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthTab('signin');
                setAuthError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authTab === 'signin'
                  ? 'bg-[#1e354d] text-white shadow-sm'
                  : 'text-[#64748b] hover:text-[#11202f]'
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
                  ? 'bg-[#1e354d] text-white shadow-sm'
                  : 'text-[#64748b] hover:text-[#11202f]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Error Banner */}

          {/* Error Banner */}
          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs animate-shake">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {authTab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#11202f] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[#8a99a8]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#faf8f3] border border-[#ded4c0] focus:border-[#1e354d] focus:ring-2 focus:ring-[#1e354d]/10 rounded-xl text-xs text-[#11202f] placeholder-[#8a99a8] focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#11202f] mb-1">
                Student / Faculty Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#8a99a8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@saveetha.ac.in"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#faf8f3] border border-[#ded4c0] focus:border-[#1e354d] focus:ring-2 focus:ring-[#1e354d]/10 rounded-xl text-xs text-[#11202f] placeholder-[#8a99a8] focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#11202f] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8a99a8]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#faf8f3] border border-[#ded4c0] focus:border-[#1e354d] focus:ring-2 focus:ring-[#1e354d]/10 rounded-xl text-xs text-[#11202f] placeholder-[#8a99a8] focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#1e354d] hover:bg-[#162a3f] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              {authLoading
                ? 'Verifying...'
                : authTab === 'signin'
                ? 'Sign In to Planner'
                : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-[#ded4c0]"></div>
            <span className="px-3 text-[10px] text-[#8a99a8] uppercase font-mono tracking-wider">
              or continue with
            </span>
            <div className="flex-1 border-t border-[#ded4c0]"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 bg-[#faf8f3] hover:bg-[#ede5d6] text-[#11202f] font-semibold rounded-xl text-xs transition border border-[#ded4c0] active:scale-[0.98]"
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
          <div className="mt-4 pt-3 border-t border-[#ded4c0] text-center">
            <button
              type="button"
              onClick={handleStudentContinue}
              className="text-xs text-[#1e354d] hover:text-blue-700 font-bold inline-flex items-center gap-1 transition"
            >
              <span>Quick Student Entry</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
