import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getEvents, deleteEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Users, Plus, Pencil, Trash2, Eye, CheckCircle, XCircle, Clock3, BarChart2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  Approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Pending:  'bg-amber-100 text-amber-700 border border-amber-200',
  Rejected: 'bg-rose-100 text-rose-600 border border-rose-200',
};

const STATUS_ICONS = {
  Approved: <CheckCircle className="w-3 h-3" />,
  Pending:  <Clock3 className="w-3 h-3" />,
  Rejected: <XCircle className="w-3 h-3" />,
};

const CATEGORY_STYLES = {
  Academic:  'bg-blue-50 text-blue-600 border-blue-100',
  Social:    'bg-purple-50 text-purple-600 border-purple-100',
  Sports:    'bg-emerald-50 text-emerald-600 border-emerald-100',
  Workshop:  'bg-amber-50 text-amber-600 border-amber-100',
  Seminar:   'bg-indigo-50 text-indigo-600 border-indigo-100',
  Cultural:  'bg-pink-50 text-pink-600 border-pink-100',
  Career:    'bg-cyan-50 text-cyan-600 border-cyan-100',
  Tech:      'bg-teal-50 text-teal-600 border-teal-100',
  Music:     'bg-rose-50 text-rose-600 border-rose-100',
  Art:       'bg-violet-50 text-violet-600 border-violet-100',
  Other:     'bg-slate-50 text-slate-600 border-slate-100',
};

export function Events() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const isOrganizer = role === 'organizer';

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // event._id to confirm deletion

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await getEvents();
      const visible = isOrganizer ? data : data.filter(e => e.status === 'Approved');
      const sorted = [...visible].sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sorted);
      setFilteredEvents(sorted);
    } catch (err) {
      console.error('Failed to load events:', err);
      toast.error('Failed to load events.');
    }
  };

  useEffect(() => {
    let result = events;
    if (categoryFilter) result = result.filter(e => e.category === categoryFilter);
    if (dateFilter) {
      const fd = new Date(dateFilter).toDateString();
      result = result.filter(e => new Date(e.date).toDateString() === fd);
    }
    if (statusFilter) result = result.filter(e => e.status === statusFilter);
    setFilteredEvents(result);
  }, [categoryFilter, dateFilter, statusFilter, events]);

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully.');
      setDeleteConfirm(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to delete event.');
    }
  };

  // Stats for organizer header
  const stats = {
    total: events.length,
    approved: events.filter(e => e.status === 'Approved').length,
    pending: events.filter(e => e.status === 'Pending').length,
    rejected: events.filter(e => e.status === 'Rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-5">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-zinc-950">Delete Event?</h3>
            <p className="text-gray-500 text-sm">This action cannot be undone. The event and all its data will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-black hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isOrganizer ? 'Event Management' : 'Upcoming Events'}
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              {isOrganizer ? 'View, edit and manage all campus events.' : 'Discover and register for amazing events on campus.'}
            </p>
          </div>
          {isOrganizer && (
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 px-5 py-3 bg-amber-400 text-zinc-950 font-black rounded-xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-200 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Create Event
            </Link>
          )}
        </div>

        {/* Organizer Stats Bar */}
        {isOrganizer && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Events', value: stats.total, color: 'bg-zinc-100 text-zinc-800', icon: <BarChart2 className="w-5 h-5" /> },
              { label: 'Approved', value: stats.approved, color: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle className="w-5 h-5" /> },
              { label: 'Pending Review', value: stats.pending, color: 'bg-amber-50 text-amber-700', icon: <Clock3 className="w-5 h-5" /> },
              { label: 'Rejected', value: stats.rejected, color: 'bg-rose-50 text-rose-600', icon: <XCircle className="w-5 h-5" /> },
            ].map(stat => (
              <div key={stat.label} className={`${stat.color} rounded-2xl p-4 flex items-center justify-between`}>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider opacity-70">{stat.label}</p>
                  <p className="text-2xl font-black">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-8 flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Social">Social</option>
              <option value="Sports">Sports</option>
              <option value="Music">Music</option>
              <option value="Career">Career</option>
              <option value="Art">Art</option>
              <option value="Workshop">Workshop</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Date</label>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          {isOrganizer && (
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button
              onClick={() => { setCategoryFilter(''); setDateFilter(''); setStatusFilter(''); }}
              className="px-4 py-2 text-sm font-black text-zinc-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-all shadow-sm active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Grid Sections */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
              <BarChart2 className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No events found matching your criteria.</p>
            {isOrganizer && (
              <Link to="/events/create" className="inline-flex items-center gap-2 px-5 py-2 bg-amber-400 text-zinc-950 font-bold rounded-xl hover:bg-amber-300 transition-all">
                <Plus className="w-4 h-4" /> Create your first event
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            {/* Upcoming Events */}
            {filteredEvents.filter(e => new Date(e.date) >= new Date()).length > 0 && (
              <div>
                {!isOrganizer && (
                  <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Clock3 className="text-amber-500" />
                    Active & Upcoming
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents
                    .filter(e => new Date(e.date) >= new Date())
                    .map(event => (
                      <EventCard key={event._id} event={event} isOrganizer={isOrganizer} setDeleteConfirm={setDeleteConfirm} />
                    ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {filteredEvents.filter(e => new Date(e.date) < new Date()).length > 0 && (
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="text-gray-400" />
                  Past Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 grayscale-[0.2]">
                  {filteredEvents
                    .filter(e => new Date(e.date) < new Date())
                    .map(event => (
                      <EventCard key={event._id} event={event} isOrganizer={isOrganizer} setDeleteConfirm={setDeleteConfirm} isPast={true} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for Event Card to avoid repetition
function EventCard({ event, isOrganizer, setDeleteConfirm, isPast = false }) {
  const navigate = useNavigate();
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group ${isPast ? 'bg-gray-50/50' : ''}`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {event.image ? (
          <img
            src={event.image.startsWith('http') ? event.image : `http://localhost:5002${event.image}`}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-medium">No Image</div>
        )}
        {/* Category badge */}
        <div className={`absolute top-3 right-3 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${CATEGORY_STYLES[event.category] || CATEGORY_STYLES.Other}`}>
          {event.category}
        </div>
        {/* Status badge — organizers only */}
        {isOrganizer && (
          <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${STATUS_STYLES[event.status] || STATUS_STYLES.Pending}`}>
            {STATUS_ICONS[event.status]}
            {event.status}
          </div>
        )}
        {isPast && !isOrganizer && (
          <div className="absolute inset-0 bg-gray-900/10 pointer-events-none flex items-center justify-center">
             <span className="bg-white/90 text-gray-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">Finished</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">{event.title}</h3>
        <div className="space-y-1.5 mb-4 flex-1">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2 text-gray-300 flex-shrink-0" />
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2 text-gray-300 flex-shrink-0" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2 text-gray-300 flex-shrink-0" />
            {event.capacity === -1
              ? 'Capacity: Unlimited'
              : `Capacity: ${event.capacity}`}
          </div>
        </div>

        {/* Footer: Organizer vs Student */}
        {isOrganizer ? (
          <div className="pt-4 border-t border-gray-100 mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800 text-sm">
                {event.ticketing?.regularPrice > 0 ? `Rs. ${event.ticketing.regularPrice}` : 'Free'}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Users className="w-3 h-3" />
                {event.participants?.length || 0} registered
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Link
                to={`/events/${event._id}`}
                className="flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </Link>
              <Link
                to={`/events/${event._id}/edit`}
                className="flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Link>
              <button
                onClick={() => setDeleteConfirm(event._id)}
                className="flex items-center justify-center gap-1 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors border border-rose-100"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
            <span className="font-bold text-gray-900">
              {event.ticketing?.regularPrice > 0 ? `Rs. ${event.ticketing.regularPrice}` : 'Free'}
            </span>
            <Link to={`/events/${event._id}`} className="text-amber-500 font-medium text-sm hover:underline">
              {isPast ? 'View Summary →' : 'View Details →'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
