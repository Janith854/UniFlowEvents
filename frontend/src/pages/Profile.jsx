import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export function ProfilePage() {
  const { user, role, token } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
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
                <p className="text-gray-900">
                  {user?.name || 'UniFlow User'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">
                  {user?.email || 'you@university.edu'}
                </p>
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
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Student Features
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• View upcoming events</li>
                <li>• Register for events</li>
                <li>• Pre-order food for events</li>
                <li>• Reserve parking spots</li>
                <li>• Submit feedback after events</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Organizer Features
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Create new events</li>
                <li>• Manage and update existing events</li>
                <li>• View registered participants</li>
                <li>• Review feedback from students</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

