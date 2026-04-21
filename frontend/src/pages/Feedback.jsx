import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { createFeedback } from '../services/feedbackService';
import { getEvents } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

export function Feedback() {
  const { user } = useAuth();
  const [form, setForm] = useState({ message: '', rating: 5, eventId: '' });
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    let err = '';
    if (name === 'message') {
      if (!value.trim()) err = 'Message is required';
      else if (value.trim().length < 10) err = 'Feedback message must be at least 10 characters';
    }
    if (name === 'rating') {
      if (Number(value) < 1 || Number(value) > 5) err = 'Rating must be between 1 and 5';
    }
    setFieldErrors(prev => ({ ...prev, [name]: err }));
    return err === '';
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await getEvents();
        setEvents(data);
        if (data.length > 0) setForm(f => ({ ...f, eventId: data[0]._id }));
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    
    // Final check
    const isMsgValid = validateField('message', form.message);
    const isRatingValid = validateField('rating', form.rating);

    if (!isMsgValid || !isRatingValid) {
      setStatus('Please fix the errors before submitting.');
      return;
    }

    try {
      await createFeedback({ 
        message: form.message, 
        rating: Number(form.rating),
        eventId: form.eventId
      });
      setStatus('Feedback submitted successfully!');
      setForm(f => ({ ...f, message: '', rating: 5 }));
      setFieldErrors({});
    } catch (error) {
      console.error('Feedback submission error:', error);
      setStatus('Failed to submit feedback.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Submit Feedback
          </h1>
          
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            {status && (
              <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
                status.includes('success') 
                  ? 'bg-green-50 text-green-700 border border-green-100' 
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {status}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Event
                </label>
                <select 
                  name="eventId" 
                  value={form.eventId} 
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                >
                  {events.length === 0 && <option value="">No events available</option>}
                  {events.map(ev => (
                    <option key={ev._id} value={ev._id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <input 
                  name="rating" 
                  type="number" 
                  min="1" 
                  max="5" 
                  value={form.rating} 
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all ${fieldErrors.rating ? 'border-rose-500 bg-rose-50/10' : 'border-gray-300'}`}
                />
                {fieldErrors.rating && <p className="mt-1 text-xs font-bold text-rose-500">{fieldErrors.rating}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea 
                  name="message" 
                  value={form.message} 
                  onChange={handleChange} 
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all resize-none ${fieldErrors.message ? 'border-rose-500 bg-rose-50/10' : 'border-gray-300'}`}
                  placeholder="Share your experience..." 
                />
                {fieldErrors.message && <p className="mt-1 text-xs font-bold text-rose-500">{fieldErrors.message}</p>}
              </div>

              <button 
                type="submit" 
                className="w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_4px_14px_0_rgba(251,191,36,0.39)]"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
