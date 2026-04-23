import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { getEvents, updateEventStatus } from '../services/eventService';
import { Check, X, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export function ApprovalQueue() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const { data } = await getEvents();
      setEvents(data.filter((e) => e.status === 'Pending'));
    } catch (err) {
      console.error('Failed to load pending events:', err);
      toast.error('Failed to load pending events');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateEventStatus(id, newStatus);
      toast.success(`Event ${newStatus} successfully`);
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error updating status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Approval Queue</h1>
          <p className="mt-2 text-gray-600">Review and approve pending event requests.</p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No pending events to approve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {event.image && (
                  <img src={event.image.startsWith('http') ? event.image : `http://localhost:5002${event.image}`} alt={event.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <div className="space-y-2 mb-6 text-sm text-gray-600 flex-1">
                    <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {new Date(event.date).toLocaleDateString()}</p>
                    <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {event.location}</p>
                    <p><strong>Organizer:</strong> {event.organizerName || event.organizer?.name || 'Unknown'}</p>
                    <p><strong>Capacity:</strong> {event.capacity === -1 ? 'Unlimited' : event.capacity}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusUpdate(event._id, 'Approved')}
                      className="flex-1 bg-amber-400 text-zinc-950 font-black py-3 rounded-xl hover:bg-amber-300 transition-all shadow-md active:scale-95 flex justify-center items-center"
                    >
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(event._id, 'Rejected')}
                      className="flex-1 bg-amber-400 text-zinc-950 font-black py-3 rounded-xl hover:bg-amber-300 transition-all shadow-md active:scale-95 flex justify-center items-center border border-zinc-950/10"
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
