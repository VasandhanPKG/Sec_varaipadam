import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRooms } from '../../context/RoomsContext';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import {
  Compass,
  Layers,
  ShieldAlert,
  LogIn,
  LogOut,
  User,
  Box,
  Map as MapIcon,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  viewMode?: '2d' | '3d';
  onViewModeChange?: (mode: '2d' | '3d') => void;
}

export const Header: React.FC<HeaderProps> = ({ viewMode, onViewModeChange }) => {
  const location = useLocation();
  const { currentFloor, setCurrentFloor, floorsMeta } = useRooms();
  const { user, logout, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isHome = location.pathname === '/';
  const isAdminPage = location.pathname === '/admin';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-slate-100 shadow-lg">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
                  SecMap
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
                CAMPUS SPATIAL TWIN & CAD SYSTEM
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Floor Selector & View Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Floor Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner">
            <span className="text-[11px] font-mono uppercase px-2 text-slate-400 hidden md:inline-flex items-center">
              <Layers className="w-3 h-3 mr-1 text-slate-500" /> Floor:
            </span>
            {[1, 2, 3, 4, 5, 6].map((fl) => {
              const active = currentFloor === fl;
              return (
                <button
                  key={fl}
                  onClick={() => setCurrentFloor(fl)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title={floorsMeta[fl]?.name || `Floor ${fl}`}
                >
                  L{fl}
                </button>
              );
            })}
          </div>

          {/* 2D / 3D View Switcher (Only on Home) */}
          {isHome && onViewModeChange && (
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => onViewModeChange('2d')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === '2d'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">2D Blueprint</span>
              </button>
              <button
                onClick={() => onViewModeChange('3d')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === '3d'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3D Twin</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Nav Links & Auth Profile */}
        <div className="flex items-center space-x-3">
          <Link
            to={isAdminPage ? '/' : '/admin'}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition ${
              isAdminPage
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {isAdminPage ? (
              <>
                <MapIcon className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">View Blueprint</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Admin Studio</span>
              </>
            )}
          </Link>

          {/* User Auth Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 pl-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition text-xs text-slate-200"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full ring-1 ring-blue-500"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="max-w-[100px] truncate hidden md:inline font-medium">
                  {user.displayName || user.email}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 font-mono uppercase rounded">
                  {user.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white truncate">{user.displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-slate-800/80 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};
