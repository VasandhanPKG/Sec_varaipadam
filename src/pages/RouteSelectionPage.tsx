import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRooms } from '../context/RoomsContext';
import { AdminLoginModal } from '../components/auth/AdminLoginModal';
import {
  Compass,
  MapPin,
  Navigation,
  ArrowRight,
  Shield,
  GraduationCap,
  RotateCcw,
  LogOut,
  AlertCircle,
} from 'lucide-react';

export const RouteSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { allBuildingDestinations } = useRooms();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Source & Destination state - Empty by default, no prefilled text, just placeholders
  const [startRoomNumber, setStartRoomNumber] = useState('');
  const [targetRoomNumber, setTargetRoomNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSwap = () => {
    const temp = startRoomNumber;
    setStartRoomNumber(targetRoomNumber);
    setTargetRoomNumber(temp);
  };

  const handleCalculateAndShowMap = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedStart = startRoomNumber.trim() || 'lift_sw';
    const trimmedTarget = targetRoomNumber.trim();

    if (!trimmedTarget) {
      setError('Please enter a destination class number (e.g. 6853, 6411, 4151).');
      return;
    }

    if (trimmedStart.toLowerCase() === trimmedTarget.toLowerCase()) {
      setError('Source and Destination cannot be the same classroom.');
      return;
    }

    // Determine start floor:
    // If it's a 4-digit room like 6853 -> Floor 6, 4151 -> Floor 4
    let sFloor = 6;
    if (/^[1-6]\d{3}$/.test(trimmedStart)) {
      sFloor = parseInt(trimmedStart[0], 10);
    } else {
      const match = allBuildingDestinations.find(
        (r) => r.id.toLowerCase() === trimmedStart.toLowerCase()
      );
      if (match?.floor) sFloor = match.floor;
    }

    // Determine target floor:
    let tFloor = 6;
    if (/^[1-6]\d{3}$/.test(trimmedTarget)) {
      tFloor = parseInt(trimmedTarget[0], 10);
    } else {
      const match = allBuildingDestinations.find(
        (r) => r.id.toLowerCase() === trimmedTarget.toLowerCase()
      );
      if (match?.floor) tFloor = match.floor;
    }

    // Navigate to Map with just the room numbers
    navigate(
      `/map?start=${encodeURIComponent(trimmedStart)}&target=${encodeURIComponent(
        trimmedTarget
      )}&sFloor=${sFloor}&tFloor=${tFloor}`
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 w-full bg-[#0d1522]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/logo.png"
            alt="SEC Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-amber-500/50 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
                SEC வரைபடம்
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[8.5px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded font-bold">
                ROUTE PLANNER
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Saveetha Engineering College • Smart Indoor Navigation
            </p>
          </div>
        </Link>

        {/* User Status & Admin Login */}
        <div className="flex items-center space-x-2.5">
          {user && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">
                {isAdmin ? <Shield className="w-3 h-3 text-amber-400" /> : <GraduationCap className="w-3 h-3 text-blue-400" />}
              </div>
              <span className="font-medium text-slate-200 max-w-[120px] truncate hidden md:inline">
                {user.displayName || user.email}
              </span>
              <button
                onClick={() => logout()}
                className="text-slate-400 hover:text-red-400 transition ml-1"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 transition active:scale-95"
            title="Administrator Login (Password only)"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Login</span>
          </button>
        </div>
      </header>

      {/* 2. SOURCE & DESTINATION SELECTION CARD (NO PRE-FILLED TEXT, NO SUGGESTIONS) */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative backdrop-blur-md space-y-6 animate-fadeIn">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Title Header */}
          <div className="text-center space-y-1.5 pb-2 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-md">
              <Navigation className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
              Type Classroom Number
            </h1>
            <p className="text-xs text-slate-400">
              Enter your starting point and destination class number to view the navigation route.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-500/40 rounded-2xl text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCalculateAndShowMap} className="space-y-4">
            {/* STARTING LOCATION INPUT */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Starting Point</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Optional (Default: SW Lift)</span>
              </label>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-400" />
                <input
                  type="text"
                  autoComplete="off"
                  value={startRoomNumber}
                  onChange={(e) => {
                    setStartRoomNumber(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. lift_sw, 6411, 4151 (Default: lift_sw)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* SWAP BUTTON */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleSwap}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-full transition shadow-sm active:scale-95"
                title="Swap Starting Point & Destination"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* DESTINATION CLASSROOM INPUT */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Destination Class Number</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400">Required</span>
              </label>

              <div className="relative">
                <Navigation className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  autoFocus
                  required
                  autoComplete="off"
                  value={targetRoomNumber}
                  onChange={(e) => {
                    setTargetRoomNumber(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. 6853, 6411, 4151, auditorium"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON - SHOW MAP */}
            <button
              type="submit"
              className="w-full mt-5 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-600/30 transition flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" />
              <span>Show Route & Open Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* ADMIN LOGIN MODAL */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        redirectToAdmin={true}
      />
    </div>
  );
};

export default RouteSelectionPage;
