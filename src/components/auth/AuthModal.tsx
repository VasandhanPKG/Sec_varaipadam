import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  Shield,
  GraduationCap,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  User,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'student' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'student',
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loginAdmin, loginStudent } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>(defaultTab);

  // Student Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Admin Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Status & Errors
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Student Email/Pass Submit
  const handleStudentEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(studentEmail, studentPassword);
      } else {
        await signInWithEmail(studentEmail, studentPassword);
      }
      setSuccessMsg('Signed in successfully as Student!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Student Access
  const handleQuickStudentLogin = () => {
    loginStudent(studentName || 'Student', studentEmail || 'student@secmap.edu');
    setSuccessMsg('Logged in as Student!');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Password Verification
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminPassword) {
      setError('Please enter the admin password.');
      return;
    }

    const success = loginAdmin(adminPassword, adminUsername || 'Administrator');
    if (success) {
      setSuccessMsg('✅ Admin authorization verified! Welcome to Admin Studio.');
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      setError('❌ Incorrect admin password. Access denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher: Student vs Admin */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
          <button
            onClick={() => {
              setActiveTab('student');
              setError(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'student'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin');
              setError(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'admin'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Login</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Header Description with Logo */}
          <div className="flex items-center gap-3.5 pb-2 border-b border-slate-800">
            <img
              src="/logo.png"
              alt="SEC வரைபடம்"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/50 shadow-md shadow-amber-500/20"
            />
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-white bg-clip-text text-transparent">
                  SEC வரைபடம்
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  • {activeTab === 'admin' ? 'Admin Portal' : 'Student Login'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeTab === 'admin'
                  ? 'Enter master password to manage rooms & spatial settings.'
                  : 'Sign in to explore campus rooms, view routes, and locate facilities.'}
              </p>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-2xl flex items-start space-x-2 text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex items-center space-x-2 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: ADMIN LOGIN - PASSWORD ONLY */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 pt-1">
              <p className="text-xs text-slate-400">
                Authorized administrators only. Enter master password to access room controls and blueprint editor.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Admin Password</span>
                  <span className="text-[10px] font-mono text-amber-400">Required</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    autoFocus
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter administrator password..."
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <KeyRound className="w-4 h-4" />
                <span>Verify & Enter Admin Studio</span>
              </button>
            </form>
          )}

          {/* TAB 2: STUDENT PORTAL */}
          {activeTab === 'student' && (
            <div className="space-y-3.5">
              {/* 1-Click Fast Student Access */}
              <button
                type="button"
                onClick={handleQuickStudentLogin}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Continue as Student (Quick Access)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-800"></div>
                <span className="px-3 text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                  or sign in with email
                </span>
                <div className="flex-1 border-t border-slate-800"></div>
              </div>

              {/* Student Email Form */}
              <form onSubmit={handleStudentEmailSubmit} className="space-y-3">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="student@college.edu"
                      className="w-full pl-10 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isSignUp ? 'Create Student Account' : 'Sign In as Student'}
                </button>
              </form>

              {/* Google Sign In option */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2.5 py-2 px-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl text-xs transition border border-white/10"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "New student? Create an account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
