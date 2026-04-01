import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getEvents } from '../services/eventService';
import { Clock, MapPin, Users } from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await getEvents();
      // Filter only approved events and map them for the calendar
      const mapped = data
        .filter((e) => e.status === 'Approved')
        .map((e) => {
          // React Big Calendar expects start and end Date objects
          const startDate = new Date(e.date);
          const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours duration
          return {
            ...e,
            title: e.title,
            start: startDate,
            end: endDate,
          };
        });
      setEvents(mapped);
    } catch (err) {
      console.error('Failed to load events for calendar:', err);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Calendar</h1>
          <p className="mt-2 text-gray-600">View upcoming approved events.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8" style={{ height: '70vh' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            views={['month', 'week', 'day']}
            defaultView="month"
          />
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative">
             <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            {selectedEvent.image && (
              <img src={`http://localhost:5001${selectedEvent.image}`} alt={selectedEvent.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
              <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {format(new Date(selectedEvent.start), 'PPP p')}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedEvent.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  Capacity: {selectedEvent.capacity}
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
