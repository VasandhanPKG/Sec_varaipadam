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

  const fillDefaultPass = () => {
    setAdminPass('admin@0718');
    setError(null);
  };

  return (
    <div className="min-h-screen w-screen bg-[#f7f5ee] spaceplanner-grid-bg flex items-center justify-center p-4 text-[#11202f] font-sans">
      <div className="w-full max-w-md bg-white border border-[#ded4c0] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-[#dbe4eb] border border-[#cad7e2] text-[#1e354d] flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-[#1e354d]" />
        </div>

        <div>
          <h2 className="text-xl font-serif font-bold text-[#11202f]">Administrator Access Required</h2>
          <p className="text-xs text-[#64748b] mt-1">
            {user
              ? `You are currently signed in as a ${user.role}. Enter admin password to proceed.`
              : 'Enter the administrator password to unlock campus management.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#11202f]">
                Admin Password
              </label>
              <button
                type="button"
                onClick={fillDefaultPass}
                className="text-[10.5px] text-[#1e354d] hover:underline font-mono"
              >
                Use default: admin@0718
              </button>
            </div>
            <input
              type="password"
              autoFocus
              required
              value={adminPass}
              onChange={(e) => {
                setAdminPass(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter admin password (admin@0718)"
              className="w-full px-3.5 py-2.5 bg-[#faf8f3] border border-[#ded4c0] rounded-xl text-sm text-[#11202f] placeholder-[#8a99a8] focus:outline-none focus:border-[#1e354d] focus:ring-1 focus:ring-[#1e354d]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#1e354d] hover:bg-[#162a3f] text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Admin Studio</span>
          </button>
        </form>

        <div className="pt-2 border-t border-[#ded4c0] text-center flex justify-between text-xs">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[#64748b] hover:text-[#11202f] transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <Link
            to="/route"
            className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 transition font-medium"
          >
            <span>Plan Route</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5ee] spaceplanner-grid-bg flex items-center justify-center font-serif font-bold text-sm text-[#11202f]">
        Loading SEC வரைபடம்...
      </div>
    );
  }
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/route'} replace />;
  }
  return <LandingPage />;
}

export function App() {
  return (
    <AuthProvider>
      <RoomsProvider>
        <Routes>
          <Route path="/" element={<RootRoute />} />
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
