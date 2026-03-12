import React from 'react';
import { Navbar } from '../components/Navbar';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Organizer Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            This is the organizer view where you will manage events, view
            participants, and review feedback.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-2">
                Create Events
              </h2>
              <p className="text-sm text-gray-600">
                Quickly publish new events for students to discover and join.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-2">
                Manage Events
              </h2>
              <p className="text-sm text-gray-600">
                Update event details, schedules, and capacities.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-2">
                Participants & Feedback
              </h2>
              <p className="text-sm text-gray-600">
                View registrations and read feedback from students.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

