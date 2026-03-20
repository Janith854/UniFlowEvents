import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/helpers';

export function EventCard({ event }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">
            {event.title}
          </h3>
          <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
            {event.category || 'Event'}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {event.description || 'Join us for this exciting event!'}
        </p>
        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-2">📅</span>
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-2">📍</span>
            {event.location}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-50">
        <span className="text-[10px] text-gray-400 font-mono uppercase">
          ID: {(event._id || event.id || '').substring(0, 8)}
        </span>
        <Link
          to={`/events/${event._id || event.id}`}
          className="text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors"
        >
          View details →
        </Link>
      </div>
    </div>
  );
}
