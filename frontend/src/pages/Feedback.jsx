import React from 'react';
import { Navbar } from '../components/Navbar';

export function Feedback() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Event Feedback
          </h1>
          <p className="text-gray-600">
            This page will list feedback you&apos;ve submitted or received for
            events.
          </p>
        </div>
      </main>
    </div>
  );
}

