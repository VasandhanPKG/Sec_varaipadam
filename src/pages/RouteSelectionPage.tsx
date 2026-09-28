import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRooms } from '../context/RoomsContext';
import { AdminLoginModal } from '../components/auth/AdminLoginModal';
import {
  Compass,
  MapPin,
  Navigation,
  Search,
  ArrowRight,
  Shield,
  GraduationCap,
  Layers,
  Sparkles,
  RotateCcw,
  Building,
  CheckCircle2,
  CornerDownRight,
  LogOut,
} from 'lucide-react';

export const RouteSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { allBuildingDestinations } = useRooms();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Source & Destination state
  const [startQuery, setStartQuery] = useState('lift_sw');
  const [startSearchText, setStartSearchText] = useState('Southwest Lift (SW Lift - Floor 6)');
  const [showStartDropdown, setShowStartDropdown] = useState(false);

  const [targetQuery, setTargetQuery] = useState('6853');
  const [targetSearchText, setTargetSearchText] = useState('6853 - Classroom Studio (Floor 6)');
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Filter lists for source and destination
  const filteredStartList = allBuildingDestinations.filter(
    (item) =>
      item.id.toLowerCase().includes(startSearchText.toLowerCase()) ||
      item.name.toLowerCase().includes(startSearchText.toLowerCase()) ||
      (item.desc && item.desc.toLowerCase().includes(startSearchText.toLowerCase()))
  );

  const filteredTargetList = allBuildingDestinations.filter(
    (item) =>
      item.id.toLowerCase().includes(targetSearchText.toLowerCase()) ||
      item.name.toLowerCase().includes(targetSearchText.toLowerCase()) ||
      (item.desc && item.desc.toLowerCase().includes(targetSearchText.toLowerCase()))
  );

  const handleSelectStart = (item: { id: string; name: string; floor?: number }) => {
    setStartQuery(item.id);
    setStartSearchText(`${item.id} - ${item.name} (Floor ${item.floor || 6})`);
    setShowStartDropdown(false);
  };

  const handleSelectTarget = (item: { id: string; name: string; floor?: number }) => {
    setTargetQuery(item.id);
    setTargetSearchText(`${item.id} - ${item.name} (Floor ${item.floor || 6})`);
    setShowTargetDropdown(false);
  };

  const handleSwap = () => {
    const tempId = startQuery;
    const tempText = startSearchText;
    setStartQuery(targetQuery);
    setStartSearchText(targetSearchText);
    setTargetQuery(tempId);
    setTargetSearchText(tempText);
  };

  const handleCalculateAndShowMap = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startQuery.trim()) {
      setError('Please select a starting point.');
      return;
    }

    if (!targetQuery.trim()) {
      setError('Please select a destination classroom or facility.');
      return;
    }

    if (startQuery.trim() === targetQuery.trim()) {
      setError('Source and Destination cannot be identical. Please pick a destination room.');
      return;
    }

    // Determine start and target floors
    let sFloor = 6;
    if (/^[1-6]\d{3}$/.test(startQuery)) {
      sFloor = parseInt(startQuery[0], 10);
    } else {
      const sItem = allBuildingDestinations.find((r) => r.id === startQuery);
      if (sItem?.floor) sFloor = sItem.floor;
    }

    let tFloor = 6;
    if (/^[1-6]\d{3}$/.test(targetQuery)) {
      tFloor = parseInt(targetQuery[0], 10);
    } else {
      const tItem = allBuildingDestinations.find((r) => r.id === targetQuery);
      if (tItem?.floor) tFloor = tItem.floor;
    }

    // Navigate to Map with search params
    navigate(`/map?start=${startQuery}&target=${targetQuery}&sFloor=${sFloor}&tFloor=${tFloor}`);
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

      {/* 2. SOURCE & DESTINATION SELECTION CARD (NO MAP VISIBLE) */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/70 relative backdrop-blur-md space-y-6 animate-fadeIn">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Title Header */}
          <div className="text-center space-y-1.5 pb-2 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-md">
              <Navigation className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
              Where would you like to go?
            </h1>
            <p className="text-xs text-slate-400">
              Select your current location and destination classroom or laboratory to generate your route.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-2xl text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCalculateAndShowMap} className="space-y-4">
            {/* STARTING LOCATION INPUT */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>1. Starting Point / Current Location</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Source</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={startSearchText}
                  onChange={(e) => {
                    setStartSearchText(e.target.value);
                    setStartQuery(e.target.value);
                    setShowStartDropdown(true);
                  }}
                  onFocus={() => setShowStartDropdown(true)}
                  placeholder="e.g. Southwest Lift, Main Entrance, Room 6853..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-400" />
              </div>

              {/* Start Dropdown */}
              {showStartDropdown && filteredStartList.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-850 border border-slate-700 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-50 p-1 divide-y divide-slate-800">
                  {filteredStartList.slice(0, 8).map((item) => (
                    <button
                      key={`start-${item.id}`}
                      type="button"
                      onClick={() => handleSelectStart(item)}
                      className="w-full p-2 text-left hover:bg-slate-750 rounded-xl transition flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-300 text-xs">{item.id}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                            Floor {item.floor || 6}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate">{item.name}</p>
                      </div>
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SWAP BUTTON */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleSwap}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-full transition shadow-sm"
                title="Swap Source and Destination"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* DESTINATION INPUT */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>2. Destination Classroom / Facility</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Destination</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={targetSearchText}
                  onChange={(e) => {
                    setTargetSearchText(e.target.value);
                    setTargetQuery(e.target.value);
                    setShowTargetDropdown(true);
                  }}
                  onFocus={() => setShowTargetDropdown(true)}
                  placeholder="e.g. 6853, 6411, 4151, Auditorium, Electronics Lab..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
                <Navigation className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-400" />
              </div>

              {/* Target Dropdown */}
              {showTargetDropdown && filteredTargetList.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-850 border border-slate-700 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-50 p-1 divide-y divide-slate-800">
                  {filteredTargetList.slice(0, 8).map((item) => (
                    <button
                      key={`target-${item.id}`}
                      type="button"
                      onClick={() => handleSelectTarget(item)}
                      className="w-full p-2 text-left hover:bg-slate-750 rounded-xl transition flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-300 text-xs">{item.id}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                            Floor {item.floor || 6}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate">{item.name}</p>
                      </div>
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick destination suggestion chips */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Quick Suggestions:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: '6853', name: '6853 Studio', floor: 6 },
                  { id: '6411', name: '6411 Comm Lab', floor: 6 },
                  { id: '4151', name: '4151 Electronics', floor: 4 },
                  { id: 'auditorium', name: 'Main Auditorium', floor: 1 },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleSelectTarget(chip)}
                    className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-300 border border-slate-700 rounded-lg transition"
                  >
                    {chip.name} (L0{chip.floor})
                  </button>
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON - SHOW MAP */}
            <button
              type="submit"
              className="w-full mt-4 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-600/30 transition flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" />
              <span>Show Route & Open Campus Map</span>
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
