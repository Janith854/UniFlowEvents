import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, MessageSquare } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { getEvents } from '../services/eventService';
import { FeedbackModal } from '../components/FeedbackModal';

export function Feedback() {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };
    fetchEvents();
  }, []);

  const handleSelectEvent = (eventId) => {
    setSelectedEventId(eventId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const now = new Date();
  const pastEvents = events
    .filter((event) => new Date(event.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const feedbackEvents = pastEvents.length > 0 ? pastEvents : events;
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-6xl mx-auto space-y-10">
          <section>
            <div className="text-center mb-8">
              <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-2">Discover Events</p>
              <h1 className="text-3xl font-black text-gray-900">Past <span className="text-amber-400">Events</span></h1>
              <p className="text-gray-500 text-sm mt-2">Browse events you have attended and share your experience.</p>
            </div>

            {feedbackEvents.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">No past events available yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbackEvents.map((event) => (
                  <div key={event._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <div className="relative h-44 overflow-hidden bg-gray-100">
                      {event.image ? (
                        <img
                          src={event.image.startsWith('http') ? event.image : `http://localhost:5002${event.image}`}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-medium">No Image</div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-amber-600">
                        {event.category || 'Event'}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                      <div className="space-y-1.5 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-300" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-300" />
                          {event.location}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectEvent(event._id)}
                        className="mt-auto w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Feedback
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <FeedbackModal
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          events={events}
          initialEventId={selectedEventId}
        />
      </main>
    </div>
  );
}
