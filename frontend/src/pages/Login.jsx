import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { User, Mail, Lock, Sparkles, ArrowRight, UserCircle, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine initial mode from URL or default to login
  const isRegisterInitial = location.pathname === '/register';
  const [isLogin, setIsLogin] = useState(!isRegisterInitial);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let err = '';
    if (name === 'email') {
      const normalizedValue = value.toLowerCase().trim();
      // Allow both student (@my.sliit.lk) and staff (@sliit.lk) domains
      const isSliit = normalizedValue.endsWith('@my.sliit.lk') || normalizedValue.endsWith('@sliit.lk');
      if (!isSliit) {
        err = 'Please use your SLIIT university email (@my.sliit.lk or @sliit.lk)';
      }
    }
    if (name === 'password') {
      if (value.length < 6) err = 'Password must be at least 6 characters';
    }
    setFieldErrors(prev => ({ ...prev, [name]: err }));
    return err === '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Final check
    // For login: only check basic email format, not domain
    // For register: enforce SLIIT domain
    const isEmailValid = isLogin 
      ? (email.includes('@') && email.trim().length > 5)
      : validateField('email', email);
    const isPassValid = password.length >= 6;
    const isNameValid = isLogin || name.trim().length > 0;
    
    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isPassValid) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!isLogin && !isNameValid) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        const loggedInUser = await login({ email, password });
        // Role-based redirect
        if (loggedInUser?.role === 'organizer') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        await register({ name, email, password, role });
        setSuccess('Account created. Please sign in to continue.');
        setIsLogin(true);
        setPassword('');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Please ensure the backend is running on port 5002.');
      } else {
        setError(err.response.data?.msg || err.response.data?.error || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px]"
        >
          {/* Brand/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400 rounded-2xl shadow-xl shadow-amber-400/20 mb-6">
              <Sparkles className="w-8 h-8 text-zinc-950" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Join UniFlow'}
            </h1>
            <p className="text-gray-500 font-medium">
              {isLogin ? 'Sign in to access your campus universe' : 'Create an account to start your journey'}
            </p>
          </div>

          <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* Redundant tabs removed as requested */}

            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.form 
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold rounded-2xl text-center"
                    >
                      {success}
                    </motion.div>
                  )}
                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
                        <UserCircle className={`w-4 h-4 transition-colors ${fieldErrors.name ? 'text-rose-500' : 'text-gray-400'}`} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        name="name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); if (fieldErrors.name) validateField('name', e.target.value); }}
                        onBlur={(e) => validateField('name', e.target.value)}
                        placeholder="John Doe"
                        className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 text-gray-900 font-medium placeholder-gray-400 transition-all outline-none ${fieldErrors.name ? 'border-rose-500/50 bg-rose-50/10' : 'border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'}`}
                      />
                      {fieldErrors.name && <p className="text-xs font-bold text-rose-500 px-1">{fieldErrors.name}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
                      <Mail className={`w-4 h-4 transition-colors ${fieldErrors.email ? 'text-rose-500' : 'text-gray-400'}`} />
                      University Email
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) validateField('email', e.target.value); }}
                      onBlur={(e) => validateField('email', e.target.value)}
                      placeholder="you@my.sliit.lk"
                      className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 text-gray-900 font-medium placeholder-gray-400 transition-all outline-none ${fieldErrors.email ? 'border-rose-500/50 bg-rose-50/10' : 'border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'}`}
                    />
                    {fieldErrors.email && <p className="text-xs font-bold text-rose-500 px-1">{fieldErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Lock className={`w-4 h-4 transition-colors ${fieldErrors.password ? 'text-rose-500' : 'text-gray-400'}`} />
                        Password
                      </label>
                      {isLogin && (
                        <button onClick={() => navigate('/forgot-password')} type="button" className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors">
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        name="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) validateField('password', e.target.value); }}
                        onBlur={(e) => validateField('password', e.target.value)}
                        placeholder="••••••••"
                        className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 pr-14 text-gray-900 font-medium placeholder-gray-400 transition-all outline-none ${fieldErrors.password ? 'border-rose-500/50 bg-rose-50/10' : 'border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-amber-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-xs font-bold text-rose-500 px-1">{fieldErrors.password}</p>}
                  </div>

                  {!isLogin && (
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 px-1">Choose Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('student')}
                          className={`py-3 rounded-2xl border-2 font-black transition-all ${role === 'student' ? 'border-amber-400 bg-amber-400 text-zinc-950' : 'border-gray-100 bg-white text-gray-500 hover:border-amber-200'}`}
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('organizer')}
                          className={`py-3 rounded-2xl border-2 font-black transition-all ${role === 'organizer' ? 'border-amber-400 bg-amber-400 text-zinc-950' : 'border-gray-100 bg-white text-gray-500 hover:border-amber-200'}`}
                        >
                          Organizer
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black py-4 px-8 rounded-2xl transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 group active:scale-95 translate-y-0 hover:-translate-y-1"
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { 
                        setIsLogin(!isLogin); 
                        setError(''); 
                        setSuccess('');
                        navigate(isLogin ? '/register' : '/login');
                      }}
                      className="text-sm font-bold text-gray-500 hover:text-amber-500 transition-colors"
                    >
                      {isLogin ? (
                        <>Need an account? <span className="text-amber-500 underline underline-offset-4">Sign Up</span></>
                      ) : (
                        <>Already have an account? <span className="text-amber-500 underline underline-offset-4">Sign In</span></>
                      )}
                    </button>
                  </div>
                </motion.form>
              </AnimatePresence>
            </div>
          </div>

          <p className="mt-8 text-center text-sm font-bold text-gray-500 px-4">
            By continuing, you agree to UniFlow's <span className="text-gray-900 underline underline-offset-4 cursor-pointer">Terms of Service</span> and <span className="text-gray-900 underline underline-offset-4 cursor-pointer">Privacy Policy</span>.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default LoginPage;

