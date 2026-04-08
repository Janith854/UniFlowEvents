import React, { useState } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/users/reset-password', { token, password });
      toast.success(data.msg);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
        <Link to="/login" className="text-amber-500 font-bold underline">Go back to Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-100">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-6">
              <ShieldCheck size={32} />
            </div>

            <h1 className="text-3xl font-black text-zinc-950 tracking-tight mb-2">
              Reset Password
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              Almost there! Enter your new password below to regain access to your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">New Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zinc-950 transition-colors" />
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:bg-white focus:border-zinc-950 transition-all outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-zinc-950 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Confirm New Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zinc-950 transition-colors" />
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:bg-white focus:border-zinc-950 transition-all outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-400 text-zinc-950 rounded-2xl py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-200 hover:bg-amber-300 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-3 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                ) : (
                  <>
                    Update Password
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
