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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11202f]/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-[#ded4c0] rounded-3xl shadow-2xl text-[#11202f] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8a99a8] hover:text-[#11202f] rounded-xl hover:bg-[#f1ede4] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-[#faf8f3] p-6 pb-4 border-b border-[#ded4c0] text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#dbe4eb] border border-[#cad7e2] text-[#1e354d] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Shield className="w-7 h-7 fill-[#1e354d] text-white" />
          </div>
          <h3 className="font-serif font-black text-lg sm:text-xl text-[#11202f] tracking-tight">
            Administrator Portal
          </h3>
          <p className="text-xs text-[#64748b] font-mono mt-1">
            SEC வரைபடம் • RESTRICTED ACCESS
          </p>
        </div>

        {/* Form Body - ONLY ASKS FOR PASSWORD */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#64748b] text-center">
            Enter the authorized master password to unlock room management, layout editor, and campus administration.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#11202f] mb-1.5 flex items-center justify-between">
                <span>Admin Password</span>
                <span className="text-[10px] font-mono text-rose-600 font-bold">Required</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8a99a8]" />
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
                  className="w-full pl-10 pr-3 py-2.5 bg-[#faf8f3] border border-[#ded4c0] focus:border-[#1e354d] focus:ring-2 focus:ring-[#1e354d]/10 rounded-xl text-sm text-[#11202f] placeholder-[#8a99a8] focus:outline-none transition shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#1e354d] hover:bg-[#162a3f] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Unlock Admin Studio'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-[#ded4c0] text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-[#64748b] hover:text-[#11202f] transition"
            >
              Cancel and return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
