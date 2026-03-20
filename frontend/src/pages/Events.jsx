import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { EventCard } from '../components/EventCard';
import { getEvents } from '../services/eventService';

export function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvents()
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">All Events</h1>
          {loading && <p className="text-gray-500">Loading events...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && events.length === 0 && (
            <p className="text-gray-500">No events found.</p>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Events;
