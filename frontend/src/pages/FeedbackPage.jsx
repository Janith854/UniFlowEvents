import React from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export function FeedbackPage() {
  const { eventId } = useParams();

  return (
    <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Feedback for Event {eventId}
          </h1>
          <p className="text-gray-600">
            Here you can show feedback details or a form for the selected
            event.
          </p>
        </div>
      </main>
    </div>
  );
}

