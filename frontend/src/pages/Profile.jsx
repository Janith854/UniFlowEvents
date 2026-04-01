import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { user, role, token, updateProfile, updatePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await updateProfile({ name, email });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Password changed successfully.');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to change password.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {message && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">{message}</p>}
          {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}

          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Profile Overview
            </h1>
            <p className="text-gray-600 mb-6">
              You are signed in as a{' '}
              <span className="font-semibold">
                {role === 'organizer' ? 'Organizer' : 'Student'}
              </span>
              .
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900">{user?.name || 'UniFlow User'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{user?.email || 'you@university.edu'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  JWT Token (stored in localStorage)
                </p>
                <p className="text-xs text-gray-500 break-all bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {token || 'No token'}
                </p>
              </div>
            </div>

            {role === 'organizer' && (
              <div className="mt-6">
                <Link
                  to="/users"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-400 text-zinc-950 font-semibold hover:bg-amber-300 transition-colors"
                >
                  Open User Management
                </Link>
              </div>
            )}
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <form onSubmit={handleProfileSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-400 text-zinc-950 font-semibold py-2.5 rounded-lg hover:bg-amber-300 transition-colors"
              >
                Save Profile
              </button>
            </form>

            <form onSubmit={handlePasswordSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-900 text-white font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Update Password
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

