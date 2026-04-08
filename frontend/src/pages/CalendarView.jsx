import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getEvents } from '../services/eventService';
import {
  Clock, MapPin, Users, X, CalendarDays, ChevronLeft, ChevronRight,
  Tag, Search, LayoutGrid, List, Info, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CATEGORY_COLORS = {
  Academic:  { bg: '#3b82f6', light: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  Social:    { bg: '#8b5cf6', light: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  Sports:    { bg: '#10b981', light: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  Workshop:  { bg: '#f59e0b', light: '#fffbeb', text: '#92400e', border: '#fde68a' },
  Cultural:  { bg: '#ec4899', light: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' },
  Other:     { bg: '#64748b', light: '#f8fafc', text: '#334155', border: '#cbd5e1' },
};

const getCatColor = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;

export function CalendarView() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarView, setSidebarView] = useState('upcoming'); // 'upcoming' | 'legend'

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await getEvents();
      const mapped = data
        .filter((e) => e.status === 'Approved')
        .map((e) => {
          const startDate = new Date(e.date);
          const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
          return { ...e, title: e.title, start: startDate, end: endDate };
        });
      setEvents(mapped);
      setFilteredEvents(mapped);
    } catch (err) {
      console.error('Failed to load events for calendar:', err);
    }
  };

  useEffect(() => {
    let result = events;
    if (categoryFilter !== 'All') result = result.filter(e => e.category === categoryFilter);
    if (searchQuery) result = result.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredEvents(result);
  }, [categoryFilter, searchQuery, events]);

  const eventStyleGetter = useCallback((event) => {
    const colors = getCatColor(event.category);
    return {
      style: {
        backgroundColor: colors.bg,
        border: 'none',
        borderRadius: '6px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 700,
        padding: '2px 6px',
        opacity: 0.95,
      }
    };
  }, []);

  const upcomingEvents = filteredEvents
    .filter(e => new Date(e.start) >= new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);

  const allCategories = ['All', ...Object.keys(CATEGORY_COLORS)];
  const monthTitle = format(date, 'MMMM yyyy');

  const goToday = () => setDate(new Date());
  const goBack = () => {
    const d = new Date(date);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setDate(d);
  };
  const goNext = () => {
    const d = new Date(date);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setDate(d);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="pt-24 max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
              <CalendarDays className="text-amber-400" size={30} />
              Event Calendar
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Browse and discover all approved campus events</p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {allCategories.map(cat => {
            const colors = cat === 'All' ? null : getCatColor(cat);
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  isActive
                    ? cat === 'All'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : `text-white border-transparent`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
                style={isActive && cat !== 'All' ? { backgroundColor: colors.bg, borderColor: colors.bg } : {}}
              >
                {cat !== 'All' && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isActive ? '#fff' : colors.bg }}
                  />
                )}
                {cat}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-400 self-center">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} shown
          </span>
        </div>

        <div className="flex gap-5">
          {/* Calendar Panel */}
          <div className="flex-1 min-w-0">
            {/* Custom Toolbar */}
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-3 shadow-sm flex flex-wrap items-center gap-3">
              <button onClick={goToday} className="px-4 py-2 text-xs font-black bg-amber-400 text-zinc-950 rounded-xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-200 active:scale-95">
                Today
              </button>
              <div className="flex items-center gap-1">
                <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                <span className="text-base font-black text-gray-900 min-w-[140px] text-center">{monthTitle}</span>
                <button onClick={goNext} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              </div>

              <div className="ml-auto flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                {[
                  { id: 'month', icon: LayoutGrid, label: 'Month' },
                  { id: 'week', icon: List, label: 'Week' },
                  { id: 'day', icon: CalendarDays, label: 'Day' },
                  { id: 'agenda', icon: Info, label: 'Agenda' },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      view === id ? 'bg-amber-400 shadow-md text-zinc-950' : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden" style={{ height: '65vh' }}>
              <style>{`
                .rbc-calendar { font-family: inherit; border: none; }
                .rbc-header { padding: 10px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; border-bottom: 1px solid #f3f4f6; }
                .rbc-month-view { border: none; }
                .rbc-day-bg { border-left: 1px solid #f3f4f6; }
                .rbc-month-row { border-top: 1px solid #f3f4f6; }
                .rbc-off-range-bg { background: #fafafa; }
                .rbc-today { background: #fffbeb !important; }
                .rbc-date-cell { padding: 6px 8px; font-size: 13px; font-weight: 700; color: #374151; }
                .rbc-date-cell.rbc-off-range { color: #d1d5db; }
                .rbc-event { border-radius: 6px !important; }
                .rbc-event:focus { outline: none; }
                .rbc-show-more { font-size: 11px; font-weight: 700; color: #f59e0b; padding-left: 6px; }
                .rbc-toolbar { display: none; }
                .rbc-agenda-view table.rbc-agenda-table { border: none; }
                .rbc-agenda-view table.rbc-agenda-table tbody > tr > td { padding: 10px 12px; }
                .rbc-agenda-view table.rbc-agenda-table thead > tr > th { padding: 10px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; }
                .rbc-time-view { border: none; }
                .rbc-time-header-content { border-left: 1px solid #f3f4f6; }
                .rbc-time-content { border-top: 1px solid #f3f4f6; }
              `}</style>
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', padding: '4px' }}
                onSelectEvent={e => setSelectedEvent(e)}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                popup
                toolbar={false}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-72 hidden lg:flex flex-col gap-4 shrink-0">
            {/* Sidebar Tab Toggle */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex">
                {[
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'legend', label: 'Legend' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setSidebarView(id)}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                      sidebarView === id
                        ? 'bg-amber-400 text-zinc-900'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {sidebarView === 'upcoming' && (
                  <div className="space-y-3">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No upcoming events</p>
                    ) : upcomingEvents.map(ev => {
                      const c = getCatColor(ev.category);
                      return (
                        <div key={ev._id} className="flex gap-3 p-3 rounded-xl border hover:shadow-sm transition-all cursor-pointer" style={{ borderColor: c.border, backgroundColor: c.light }}>
                          <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: c.bg }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-gray-900 line-clamp-1">{ev.title}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                              <Clock size={10} />
                              {format(new Date(ev.start), 'MMM d • h:mm a')}
                            </p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} />
                              {ev.location}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {events.filter(e => new Date(e.start) >= new Date()).length > 5 && (
                      <Link to="/events" className="flex items-center justify-center gap-1 text-xs text-amber-500 font-bold py-1 hover:text-amber-600">
                        View all events <ExternalLink size={11} />
                      </Link>
                    )}
                  </div>
                )}

                {sidebarView === 'legend' && (
                  <div className="space-y-2">
                    {Object.entries(CATEGORY_COLORS).map(([cat, c]) => (
                      <div key={cat} className="flex items-center gap-2.5 p-2 rounded-lg" style={{ backgroundColor: c.light }}>
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.bg }} />
                        <span className="text-xs font-bold" style={{ color: c.text }}>{cat}</span>
                        <span className="ml-auto text-[10px] font-bold text-gray-400">
                          {filteredEvents.filter(e => e.category === cat).length}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quick Stats</p>
              {[
                { label: 'Total Events', value: events.length },
                { label: 'Upcoming', value: events.filter(e => new Date(e.start) >= new Date()).length },
                { label: 'This Month', value: events.filter(e => {
                  const d = new Date(e.start);
                  return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
                }).length },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">{label}</span>
                  <span className="text-sm font-black text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedEvent(null)}>
          <div
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="h-2" style={{ backgroundColor: getCatColor(selectedEvent.category).bg }} />

            {selectedEvent.image && (
              <img
                src={selectedEvent.image.startsWith('http') ? selectedEvent.image : `http://localhost:5002${selectedEvent.image}`}
                alt={selectedEvent.title}
                className="w-full h-44 object-cover"
              />
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2"
                    style={{ backgroundColor: getCatColor(selectedEvent.category).light, color: getCatColor(selectedEvent.category).text }}
                  >
                    <Tag size={10} /> {selectedEvent.category}
                  </span>
                  <h3 className="text-xl font-black text-gray-900">{selectedEvent.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="mt-1 p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedEvent.description && (
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">{selectedEvent.description}</p>
              )}

              <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-5">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{format(new Date(selectedEvent.start), 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-xs text-gray-500">{format(new Date(selectedEvent.start), 'h:mm a')} – {format(new Date(selectedEvent.end), 'h:mm a')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-800">{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Users size={14} className="text-green-600" />
                  </div>
                  <span className="font-medium text-gray-800">Capacity: {selectedEvent.capacity}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedEvent(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors text-sm">
                  Close
                </button>
                <Link
                  to={`/events/${selectedEvent._id}`}
                  className="flex-1 py-3 bg-amber-400 text-zinc-900 font-bold rounded-2xl hover:bg-amber-300 transition-colors text-sm text-center"
                  onClick={() => setSelectedEvent(null)}
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
