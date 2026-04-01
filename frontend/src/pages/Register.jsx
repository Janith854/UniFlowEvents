import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({ name, email, password, role });
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          'Cannot reach backend server. Make sure backend is running on port 5001.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-10 min-h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Create your UniFlowEvents account
          </h1>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                University Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2.5 rounded-lg border text-sm font-medium ${
                    role === 'student'
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`py-2.5 rounded-lg border text-sm font-medium ${
                    role === 'organizer'
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  Organizer
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)]"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-amber-500 hover:text-amber-400">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;
