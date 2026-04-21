import React, { useState } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { KeyRound, Mail, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', msg: '' });
    
    try {
      const { data } = await axios.post('/api/users/forgot-password', { email });
      setStatus({ type: 'success', msg: data.msg });
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.msg || 'Failed to send reset link' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-zinc-950 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-100">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
              <KeyRound size={32} />
            </div>

            <h1 className="text-3xl font-black text-zinc-950 tracking-tight mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              No worries! Enter your email and we'll send you a link to reset your password.
            </p>

            {status.msg && (
              <div className={`mb-6 p-4 rounded-2xl text-sm font-bold ${
                status.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {status.msg}
                {previewUrl && (
                  <div className="mt-2">
                    <a 
                      href={previewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-800 underline block"
                    >
                      [DEV ONLY] View Test Email
                    </a>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zinc-950 transition-colors" />
                  <input 
                    required
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-zinc-950 transition-all outline-none"
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
                    <Send size={18} />
                    Send Reset Link
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
