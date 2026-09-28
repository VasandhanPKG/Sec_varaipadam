import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoomsProvider } from './context/RoomsContext';
import { LandingPage } from './pages/LandingPage';
import { RouteSelectionPage } from './pages/RouteSelectionPage';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ShieldAlert, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loginAdmin, user } = useAuth();
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isAdmin) {
    return <>{children}</>;
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(adminPass);
    if (!success) {
      setError('❌ Incorrect admin password. Access denied.');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
          <p className="text-xs text-slate-400 mt-1">
            {user
              ? `You are currently signed in as a ${user.role}. Enter admin password to proceed.`
              : 'Enter the administrator password to unlock campus management.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              autoFocus
              required
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Admin Studio</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center flex justify-between text-xs">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <Link
            to="/route"
            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition font-medium"
          >
            <span>Plan Route</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <RoomsProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/route" element={<RouteSelectionPage />} />
          <Route path="/map" element={<HomePage />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </RoomsProvider>
    </AuthProvider>
  );
}

export default App;
