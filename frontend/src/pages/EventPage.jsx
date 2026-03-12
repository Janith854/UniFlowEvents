import React from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export function EventPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Event Details
          </h1>
          <p className="text-gray-600 mb-2">
            This page will show full details for event ID: <strong>{id}</strong>
          </p>
          <p className="text-gray-500 text-sm">
            Later you can connect this to your event service to load real data.
          </p>
        </div>
      </main>
    </div>
  );
}

