import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { AdminLoginModal } from '../auth/AdminLoginModal';
import {
  Compass,
  Layers,
  ShieldCheck,
  LogIn,
  LogOut,
  User,
  Box,
  Map as MapIcon,
  ChevronDown,
  Shield,
  KeyRound,
  GraduationCap,
} from 'lucide-react';

interface HeaderProps {
  viewMode?: '2d' | '3d';
  onViewModeChange?: (mode: '2d' | '3d') => void;
}

export const Header: React.FC<HeaderProps> = ({ viewMode, onViewModeChange }) => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'student' | 'admin'>('student');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isMapPage = location.pathname === '/map' || location.pathname === '/';
  const isAdminPage = location.pathname === '/admin';

  const openAdminLogin = () => {
    setShowAdminModal(true);
  };

  const openStudentLogin = () => {
    setAuthModalTab('student');
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-4 py-2 flex items-center justify-between text-slate-100 shadow-md">
        {/* Brand */}
        <div className="flex items-center space-x-2 shrink-0">
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src="/logo.png"
              alt="SEC வரைபடம்"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-amber-500/50 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-sm sm:text-base tracking-tight bg-gradient-to-r from-amber-400 via-yellow-200 to-white bg-clip-text text-transparent">
                  SEC வரைபடம்
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.2 text-[8.5px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded font-bold">
                  VARAIPADAM
                </span>
              </div>
              <p className="text-[9px] font-mono text-slate-400 hidden lg:block">
                CAMPUS 3D MAP & INDOOR NAVIGATION
              </p>
            </div>
          </Link>
        </div>

        {/* Center: 2D / 3D View Switcher */}
        {isMapPage && onViewModeChange && (
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 sm:p-1 shadow-inner shrink-0">
            <button
              onClick={() => onViewModeChange('2d')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition ${
                viewMode === '2d'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="2D Blueprint View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>2D Blueprint</span>
            </button>
            <button
              onClick={() => onViewModeChange('3d')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition ${
                viewMode === '3d'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="3D Building Twin"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Twin</span>
            </button>
          </div>
        )}

        {/* Right: Admin Link & Auth */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Admin Studio Link if already logged in as Admin */}
          {isAdmin ? (
            <Link
              to={isAdminPage ? '/map' : '/admin'}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition shadow-sm ${
                isAdminPage
                  ? 'bg-blue-600 text-white border-blue-500 shadow-blue-600/20'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 hover:text-white'
              }`}
            >
              {isAdminPage ? (
                <>
                  <MapIcon className="w-3.5 h-3.5 text-blue-200" />
                  <span className="hidden sm:inline">View Blueprint</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Admin Studio</span>
                </>
              )}
            </Link>
          ) : (
            <button
              onClick={openAdminLogin}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 font-semibold text-xs rounded-xl transition active:scale-95"
              title="Admin Login (Password only)"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Admin</span>
            </button>
          )}

          {/* User Auth Dropdown & Direct Logout */}
          {user ? (
            <div className="flex items-center space-x-1.5">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 pl-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition text-xs text-slate-200"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-600/30 text-blue-300'
                    }`}
                  >
                    {isAdmin ? <Shield className="w-3 h-3 text-amber-400" /> : <GraduationCap className="w-3 h-3 text-blue-400" />}
                  </div>
                  <span className="max-w-[100px] truncate hidden md:inline font-medium">
                    {user.displayName || user.email}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 font-mono uppercase rounded font-bold ${
                      isAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {user.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 text-xs animate-fadeIn">
                    <div className="px-3.5 py-2.5 border-b border-slate-800">
                      <p className="font-bold text-white truncate">{user.displayName || user.email}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono capitalize">
                        Role: {user.role}
                      </span>
                    </div>

                    {!isAdmin && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openAdminLogin();
                        }}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-amber-400 hover:bg-slate-800/80 transition text-left"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Admin Sign In</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3.5 py-2 text-red-400 hover:bg-slate-800/80 transition text-left font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* One-Click Quick Sign Out */}
              <button
                onClick={() => logout()}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold transition active:scale-95"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={openStudentLogin}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />

      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        redirectToAdmin={true}
      />
    </>
  );
};
