import React, { useState, useEffect } from 'react';
import * as feedbackService from '../services/feedbackService';
import { MessageSquare, Star, Filter, Send, Trash2, Smile, Meh, Frown, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { FeedbackStats } from '../components/FeedbackStats';

export function OrganizerFeedbackDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ rating: 'All', sentiment: 'All' });

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await feedbackService.getFeedbackStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, feedbacks]);

  const applyFilters = () => {
    let result = feedbacks;
    if (filters.rating !== 'All') {
      result = result.filter(f => f.overall?.rating === Number(filters.rating));
    }
    if (filters.sentiment !== 'All') {
      result = result.filter(f => f.sentiment === filters.sentiment);
    }
    setFilteredFeedbacks(result);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await feedbackService.deleteFeedback(id);
      toast.success('Feedback deleted');
      fetchFeedback();
      fetchStats();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleSendReply = (feedback) => {
    toast.success(`Reply sent to ${feedback.user?.name || 'Student'}: "${feedback.aiSuggestedReply}"`);
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return <Smile className="text-green-500" size={18} />;
      case 'Neutral': return <Meh className="text-amber-500" size={18} />;
      case 'Negative': return <Frown className="text-red-500" size={18} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h1 className="text-4xl font-black text-zinc-950 tracking-tighter flex items-center gap-3">
                <MessageSquare className="text-amber-400" size={40} />
                Feedback Dashboard
              </h1>
              <p className="text-gray-500 font-medium">Manage student experiences and AI-driven insights</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                <Filter size={16} className="text-gray-400" />
                <select 
                  className="bg-transparent text-sm font-bold text-zinc-950 outline-none cursor-pointer"
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: e.target.value})}
                >
                  <option value="All">All Ratings</option>
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                </select>
              </div>

              <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                <Filter size={16} className="text-gray-400" />
                <select 
                  className="bg-transparent text-sm font-bold text-zinc-950 outline-none cursor-pointer"
                  value={filters.sentiment}
                  onChange={(e) => setFilters({...filters, sentiment: e.target.value})}
                >
                  <option value="All">All Sentiments</option>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>
            </div>
          </div>

          <FeedbackStats stats={stats} />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-amber-100 border-t-amber-400 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Student & Event</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Rating</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Sentiment</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Feedback Message</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">AI Suggested Reply</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFeedbacks.length > 0 ? filteredFeedbacks.map((f) => (
                      <tr key={f._id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <p className="font-black text-zinc-950 text-sm leading-tight">{f.user?.name || 'Unknown'}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{f.event?.title || 'General'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-1">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            <span className="font-black text-zinc-950">{f.overall?.rating ?? '-'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-2">
                            {getSentimentIcon(f.sentiment)}
                            <span className={`text-[11px] font-black uppercase tracking-tighter ${
                              f.sentiment === 'Positive' ? 'text-green-600' :
                              f.sentiment === 'Negative' ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              {f.sentiment || 'Analyzing...'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{f.overall?.comment || 'No comment provided.'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 max-w-sm">
                            <p className="text-[11px] italic text-zinc-700 leading-relaxed font-medium">"{f.aiSuggestedReply || 'Generating response...'}"</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleSendReply(f)}
                              className="p-3 bg-amber-400 text-zinc-950 rounded-2xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-200"
                              title="Send AI Reply"
                            >
                              <Send size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(f._id)}
                              className="p-3 bg-amber-400 text-zinc-950 rounded-2xl hover:bg-amber-300 transition-all border border-zinc-950/10"
                              title="Delete Feedback"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-400">
                            <CheckCircle2 size={48} strokeWidth={1} />
                            <p className="text-lg font-bold">No feedback matches your filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
