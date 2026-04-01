import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getEvents } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Users, Plus } from 'lucide-react';

export function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { role } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await getEvents();
      // Show only approved events to regular users. Organizers might want to see all in a specific view, but let's stick to Approved for the public list.
      const approved = data.filter(e => e.status === 'Approved');
      setEvents(approved);
      setFilteredEvents(approved);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  useEffect(() => {
    let result = events;
    if (categoryFilter) {
      result = result.filter(e => e.category === categoryFilter);
    }
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      result = result.filter(e => new Date(e.date).toDateString() === filterDate);
    }
    setFilteredEvents(result);
  }, [categoryFilter, dateFilter, events]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
            <p className="mt-2 text-gray-600">Discover and register for amazing events on campus.</p>
          </div>
          {role === 'organizer' && (
            <Link to="/events/create" className="inline-flex items-center px-4 py-2 bg-amber-400 text-zinc-950 font-bold rounded-lg hover:bg-amber-300 transition-colors shadow-sm">
              <Plus className="w-5 h-5 mr-2" /> Create Event
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2">
              <option value="">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Social">Social</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div className="flex items-end">
            <button onClick={() => { setCategoryFilter(''); setDateFilter(''); }} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <Link to={`/events/${event._id}`} key={event._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {event.image ? (
                    <img src={`http://localhost:5001${event.image}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-amber-600">
                    {event.category}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      Capacity: {event.participants?.length || 0} / {event.capacity}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <span className="font-bold text-gray-900">
                      {event.ticketing?.regularPrice > 0 ? `$${event.ticketing.regularPrice}` : 'Free'}
                    </span>
                    <span className="text-amber-500 font-medium text-sm">View Details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
