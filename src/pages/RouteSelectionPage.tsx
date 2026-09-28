import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRooms } from '../context/RoomsContext';
import { AdminLoginModal } from '../components/auth/AdminLoginModal';
import { resolveRoomFloor } from '../lib/pathfinding';
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
      setError('Please enter a destination class number (e.g. 6681, 5371, 4331, 2411, 1581, 0481).');
      return;
    }

    if (trimmedStart.toLowerCase() === trimmedTarget.toLowerCase()) {
      setError('Source and Destination cannot be the same classroom.');
      return;
    }

    const sFloor = resolveRoomFloor(trimmedStart, 6, allBuildingDestinations);
    const tFloor = resolveRoomFloor(trimmedTarget, sFloor, allBuildingDestinations);

    // Navigate to Map with just the room numbers
    navigate(
      `/map?start=${encodeURIComponent(trimmedStart)}&target=${encodeURIComponent(
        trimmedTarget
      )}&sFloor=${sFloor}&tFloor=${tFloor}`
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f5ee] spaceplanner-grid-bg text-[#11202f] flex flex-col selection:bg-[#dbe4eb] selection:text-[#1e354d]">
      {/* 1. TOP HEADER (SPACEPLANNER THEME) */}
      <header className="sticky top-0 z-40 w-full bg-[#fcfaf6]/95 backdrop-blur-md border-b border-[#ded4c0] px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/logo.png"
            alt="SEC Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-[#ded4c0] shadow-sm group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-black text-base sm:text-lg tracking-tight text-[#11202f]">
                SEC வரைபடம்
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[8.5px] font-mono uppercase bg-[#dbe4eb] text-[#1e354d] border border-[#cad7e2] rounded-full font-bold">
                ROUTE PLANNER
              </span>
            </div>
            <p className="text-[10px] text-[#64748b] hidden sm:block">
              Saveetha Engineering College • Auditorium Block
            </p>
          </div>
        </Link>

        {/* User Status & Admin Login & Logout */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-[#fcfaf6] border border-[#ded4c0] rounded-xl text-xs shadow-xs">
                <div className="w-5 h-5 rounded-full bg-[#dbe4eb] text-[#1e354d] flex items-center justify-center font-bold text-[10px]">
                  {isAdmin ? <Shield className="w-3 h-3 text-[#1e354d]" /> : <GraduationCap className="w-3 h-3 text-[#1e354d]" />}
                </div>
                <span className="font-medium text-[#11202f] max-w-[110px] truncate hidden md:inline">
                  {user.displayName || user.email}
                </span>
                <span className="text-[9.5px] px-1.5 py-0.2 font-mono uppercase bg-[#dbe4eb] text-[#1e354d] rounded font-bold">
                  {user.role}
                </span>
              </div>

              {/* Dedicated Logout Button */}
              <button
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
                title="Log Out of your account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/"
              className="flex items-center space-x-1 px-3 py-1.5 bg-[#1e354d] hover:bg-[#162a3f] text-white rounded-xl text-xs font-bold transition"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#1e354d] hover:bg-[#162a3f] text-white shadow-sm transition active:scale-95"
            title="Administrator Login (Password only)"
          >
            <Shield className="w-3.5 h-3.5 fill-white text-[#1e354d]" />
            <span className="hidden xs:inline">Admin Login</span>
          </button>
        </div>
      </header>

      {/* 2. BREADCRUMB & HEADER TAG */}
      <div className="max-w-md mx-auto w-full px-4 pt-6 text-left">
        <div className="text-[12px] font-mono text-[#64748b] mb-2 flex items-center gap-1.5">
          <Link to="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-[#11202f] font-semibold">Route Planner</span>
        </div>
        <div className="inline-block px-3 py-1 bg-[#dbe4eb] text-[#1e354d] text-[11px] font-mono font-bold uppercase rounded-lg border border-[#cad7e2] tracking-wider mb-2">
          WAYFINDING
        </div>
      </div>

      {/* 3. SOURCE & DESTINATION SELECTION CARD (SPACEPLANNER THEME) */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md bg-white border border-[#ded4c0] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#11202f]/5 relative space-y-6 animate-fadeIn">
          {/* Title Header */}
          <div className="text-center space-y-1.5 pb-2 border-b border-[#ded4c0]">
            <div className="w-12 h-12 rounded-2xl bg-[#dbe4eb] text-[#1e354d] flex items-center justify-center mx-auto shadow-xs border border-[#cad7e2]">
              <Navigation className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#11202f] tracking-tight">
              Type Classroom Number
            </h1>
            <p className="text-xs text-[#64748b]">
              Enter starting point and destination room to generate your blueprint route.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCalculateAndShowMap} className="space-y-4">
            {/* STARTING LOCATION INPUT */}
            <div>
              <label className="block text-xs font-semibold text-[#11202f] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#1e354d] font-bold">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Starting Point</span>
                </span>
                <span className="text-[10px] font-mono text-[#8a99a8]">Default: lift_sw</span>
              </label>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-blue-600" />
                <input
                  type="text"
                  autoComplete="off"
                  value={startRoomNumber}
                  onChange={(e) => {
                    setStartRoomNumber(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. lift_sw, 6411, 4151 (Default: lift_sw)"
                  className="w-full pl-10 pr-4 py-3 bg-[#faf8f3] border border-[#ded4c0] focus:border-[#1e354d] focus:ring-2 focus:ring-[#1e354d]/10 rounded-2xl text-xs sm:text-sm font-mono text-[#11202f] placeholder-[#8a99a8] focus:outline-none transition"
                />
              </div>
            </div>

            {/* SWAP BUTTON */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleSwap}
                className="p-1.5 bg-[#faf8f3] hover:bg-[#ede5d6] border border-[#ded4c0] text-[#64748b] hover:text-[#11202f] rounded-full transition shadow-2xs active:scale-95"
                title="Swap Starting Point & Destination"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* DESTINATION CLASSROOM INPUT */}
            <div>
              <label className="block text-xs font-semibold text-[#11202f] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#1e354d] font-bold">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Destination Class Number</span>
                </span>
                <span className="text-[10px] font-mono text-blue-600 font-bold">Required</span>
              </label>

              <div className="relative">
                <Navigation className="absolute left-3.5 top-3.5 w-4 h-4 text-blue-600" />
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
                  placeholder="e.g. 6681, 5371, 4331, 2411, 1581, 0481"
                  className="w-full pl-10 pr-4 py-3 bg-[#faf8f3] border border-[#ded4c0] focus:border-[#1e354d] focus:ring-2 focus:ring-[#1e354d]/10 rounded-2xl text-xs sm:text-sm font-mono text-[#11202f] placeholder-[#8a99a8] focus:outline-none transition"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON - SHOW MAP */}
            <button
              type="submit"
              className="w-full mt-5 py-3.5 px-6 bg-[#1e354d] hover:bg-[#162a3f] text-white font-bold rounded-2xl text-sm shadow-md transition flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-[#ded4c0]" />
              <span>Show Route & Open Blueprint Map</span>
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
