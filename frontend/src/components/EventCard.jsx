import React from 'react';
import { Link } from 'react-router-dom';

export function EventCard({ event }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500">
          Short description of the event goes here.
        </p>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-400">ID: {event.id}</span>
        <Link
          to={`/events/${event.id}`}
          className="text-sm font-semibold text-amber-500 hover:text-amber-400"
        >
          View details
        </Link>
      </div>
    </div>
  );
}

