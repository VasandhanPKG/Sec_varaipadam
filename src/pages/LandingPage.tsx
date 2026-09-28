import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRooms } from '../context/RoomsContext';
import { AdminLoginModal } from '../components/auth/AdminLoginModal';
import {
  Compass,
  MapPin,
  Search,
  Navigation,
  Layers,
  Box,
  Shield,
  KeyRound,
  GraduationCap,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Mail,
  Lock,
  User,
  ArrowUpRight,
  ExternalLink,
  Flame,
  MousePointerClick,
  Building2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, loginStudent, logout, isAdmin } = useAuth();
  const { allBuildingDestinations } = useRooms();

  // Admin Modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Auth Card Tab: 'signin' | 'signup'
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Quick Classroom Search State
  const [searchQuery, setSearchQuery] = useState('');

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
      navigate('/map');
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
      navigate('/map');
    } catch (err: any) {
      setAuthError(err?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // 1-Click Guest / Student Access
  const handleQuickStudentAccess = () => {
    loginStudent('Guest Student', 'student@secmap.edu');
    navigate('/map');
  };

  // Handle Quick Search
  const filteredQuickRooms = allBuildingDestinations
    .filter(
      (r) =>
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.desc && r.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .slice(0, 6);

  const handleRoomClick = (roomId: string, floor?: number) => {
    const targetFloor = floor || (/^[1-6]\d{3}$/.test(roomId) ? parseInt(roomId[0], 10) : 6);
    navigate(`/map?room=${roomId}&floor=${targetFloor}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 w-full bg-[#0d1522]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
        {/* Brand & Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/logo.png"
            alt="SEC Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-amber-500/50 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-black text-base sm:text-xl tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
                SEC வரைபடம்
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded font-bold">
                CAMPUS MAP
              </span>
            </div>
            <p className="text-[10px] font-sans text-slate-400 hidden sm:block">
              Saveetha Engineering College • Smart Indoor Navigation
            </p>
          </div>
        </Link>

        {/* Top Right Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          {/* Quick Launch Map Button */}
          <Link
            to="/map"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Launch Map</span>
          </Link>

          {/* ADMIN LOGIN BUTTON - PROMINENT AT TOP RIGHT (Password Only Modal) */}
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-600/30 transition-all transform active:scale-95 border border-amber-400/40"
            title="Administrator Login (Password only required)"
          >
            <Shield className="w-4 h-4 fill-slate-950" />
            <span>Admin Login</span>
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION + AUTH CARD */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
        {/* Left Column: Hero Copy & Class Quick Search */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>2D Blueprint & 3D Digital Twin Navigation</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white leading-[1.15]">
              Find Any Classroom in{' '}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                Seconds.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-xl">
              Experience the intelligent campus indoor wayfinding system for{' '}
              <strong className="text-white">Saveetha Engineering College</strong>. Instant routing
              from the Southwest Lift to any class, laboratory, studio, or facility across all 6 floors.
            </p>
          </div>

          {/* Instant Quick Search Bar */}
          <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Classroom Finder</span>
              </span>
              <span className="text-[11px] text-slate-400">Type class number or room name</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 6853, 6411, 4151, Main Auditorium, Lab..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>

            {/* Quick Class Chips / Search Results */}
            {searchQuery.trim() ? (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Matching Rooms:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredQuickRooms.length > 0 ? (
                    filteredQuickRooms.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleRoomClick(r.id, r.floor)}
                        className="flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-left transition group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-amber-300 text-xs">{r.id}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                              L0{r.floor || 6}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 truncate mt-0.5">{r.name}</p>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0 transition" />
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-1 col-span-2">No matching classrooms found.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Popular Destinations:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: '6853', label: '6853 Studio', floor: 6 },
                    { id: '6411', label: '6411 Comm Lab', floor: 6 },
                    { id: '4151', label: '4151 Electronics', floor: 4 },
                    { id: 'auditorium', label: 'Main Auditorium', floor: 1 },
                    { id: 'lift_sw', label: 'SW Lift', floor: 6 },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => handleRoomClick(chip.id, chip.floor)}
                      className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 rounded-lg transition flex items-center gap-1"
                    >
                      <span>{chip.label}</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Direct CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/map"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-600/30 transition flex items-center space-x-2 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Interactive Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleQuickStudentAccess}
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl text-sm border border-slate-700 transition flex items-center space-x-2"
            >
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Instant Guest Access</span>
            </button>
          </div>
        </div>

        {/* Right Column: Unified Authentication Card (Sign In / Create Account) */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-md">
            {/* Ambient gold glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Auth Tabs: Sign In / Create Account */}
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

            {/* Current user badge if already signed in */}
            {user && (
              <div className="mb-5 p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-xs">
                    {user.role === 'admin' ? <Shield className="w-4 h-4 text-amber-400" /> : <GraduationCap className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate">{user.displayName || user.email}</p>
                    <span className="text-[10px] font-mono text-blue-300 uppercase">{user.role} Active</span>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="text-[11px] text-red-400 hover:text-red-300 font-semibold underline"
                >
                  Switch
                </button>
              </div>
            )}

            {/* Auth Title */}
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {authTab === 'signin' ? 'Welcome Back' : 'Join SEC வரைபடம்'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {authTab === 'signin'
                  ? 'Sign in to save favorite routes and classroom bookmarks.'
                  : 'Register a student or faculty profile for personalized campus tools.'}
              </p>
            </div>

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
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
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
                  ? 'Processing...'
                  : authTab === 'signin'
                  ? 'Sign In to Campus Map'
                  : 'Create Student Account'}
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

            {/* Fast Guest Entry Link */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={handleQuickStudentAccess}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 transition"
              >
                <span>Don't want to sign in? Continue as Guest</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 3. CAMPUS FEATURES SHOWCASE */}
      <section className="bg-slate-950/60 border-t border-slate-800/80 py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-amber-400 font-mono text-xs uppercase font-bold tracking-widest">
              State of the Art
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-white">
              Complete Campus Navigation Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Designed specifically for engineering students, faculty, and campus visitors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Floor Precision Routing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates turn-by-turn routes with real-time waypoint steps from the Southwest Lift to any room on Floors 1 through 6.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">3D Digital Twin Simulation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Realistic 3D architectural representation with cutaway floor slicing, facade inspection, and 360° camera controls.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Protected Admin CMS Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single-password administrative gateway to update classroom names, departments, instructors, and physical coordinates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-[#080d14] border-t border-slate-800/80 py-8 px-4 sm:px-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <img src="/logo.png" alt="SEC Logo" className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-500/30" />
            <span className="font-serif font-bold text-slate-200">
              SEC வரைபடம் • Saveetha Engineering College
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <Link to="/map" className="hover:text-amber-400 transition">
              Live Map
            </Link>
            <button onClick={() => setIsAdminModalOpen(true)} className="hover:text-amber-400 transition">
              Admin Portal
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">Built with 💙 for SEC</span>
          </div>
        </div>
      </footer>

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
