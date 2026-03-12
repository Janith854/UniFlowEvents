import React from 'react';
import { Navbar } from '../components/Navbar';
import { EventCard } from '../components/EventCard';

export function Events() {
  const mockEvents = [
    { id: '1', title: 'Tech Innovation Summit' },
    { id: '2', title: 'Spring Music Festival' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            All Events
          </h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

