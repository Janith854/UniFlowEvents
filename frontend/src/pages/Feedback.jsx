import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { createFeedback } from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';

export function Feedback() {
  const { user } = useAuth();
  const [form, setForm] = useState({ message: '', rating: 5 });
  const [status, setStatus] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      await createFeedback({ 
        user: user?.id, 
        message: form.message, 
        rating: Number(form.rating) 
      });
      setStatus('Feedback submitted successfully!');
      setForm({ message: '', rating: 5 });
    } catch (error) {
      console.error('Feedback submission error:', error);
      setStatus('Failed to submit feedback.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-xl mx-auto">
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
                  Rating (1-5)
                </label>
                <input 
                  name="rating" 
                  type="number" 
                  min="1" 
                  max="5" 
                  value={form.rating} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea 
                  name="message" 
                  value={form.message} 
                  onChange={handleChange} 
                  required 
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Share your experience..." 
                />
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
