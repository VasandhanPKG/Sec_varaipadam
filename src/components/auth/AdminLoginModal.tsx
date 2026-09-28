import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Lock, KeyRound, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectToAdmin?: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  redirectToAdmin = true,
}) => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminPassword.trim()) {
      setError('Please enter the administrator password.');
      return;
    }

    setLoading(true);
    const success = loginAdmin(adminPassword.trim());

    if (success) {
      setSuccessMsg('✅ Authorization verified. Welcome, Administrator!');
      setTimeout(() => {
        setLoading(false);
        onClose();
        if (redirectToAdmin) {
          navigate('/admin');
        }
      }, 500);
    } else {
      setLoading(false);
      setError('❌ Incorrect password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-950/40 text-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 p-6 pb-4 border-b border-slate-800 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-black text-lg sm:text-xl text-white tracking-tight">
            Administrator Portal
          </h3>
          <p className="text-xs text-amber-300/80 font-mono mt-1">
            SEC வரைபடம் • RESTRICTED ACCESS
          </p>
        </div>

        {/* Form Body - ONLY ASKS FOR PASSWORD */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400 text-center">
            Enter the authorized master password to unlock room management, layout editor, and campus administration.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
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
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter administrator password..."
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Unlock Admin Studio'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition"
            >
              Cancel and return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
