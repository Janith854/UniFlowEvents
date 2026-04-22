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
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/50 text-amber-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-200/50">
                <Smile size={12} />
                Live Analytics
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-zinc-950 tracking-[ -0.05em] leading-none">
                Feedback <br className="hidden md:block" /> 
                <span className="text-amber-400">Dashboard.</span>
              </h1>
              <p className="text-lg text-gray-500 font-medium max-w-md">Real-time student experiences processed with AI-driven sentiment analysis.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="group bg-white pl-6 pr-4 py-4 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                <Filter size={18} className="text-gray-400 group-hover:text-amber-400 transition-colors" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Filter Rating</span>
                  <select 
                    className="bg-transparent text-sm font-black text-zinc-950 outline-none cursor-pointer"
                    value={filters.rating}
                    onChange={(e) => setFilters({...filters, rating: e.target.value})}
                  >
                    <option value="All">All Experiences</option>
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star Reviews</option>)}
                  </select>
                </div>
              </div>

              <div className="group bg-white pl-6 pr-4 py-4 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                <Filter size={18} className="text-gray-400 group-hover:text-amber-400 transition-colors" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Filter Sentiment</span>
                  <select 
                    className="bg-transparent text-sm font-black text-zinc-950 outline-none cursor-pointer"
                    value={filters.sentiment}
                    onChange={(e) => setFilters({...filters, sentiment: e.target.value})}
                  >
                    <option value="All">All Moods</option>
                    <option value="Positive">Happy Vibes</option>
                    <option value="Neutral">Neutral Ground</option>
                    <option value="Negative">Needs Attention</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <FeedbackStats stats={stats} isLoading={isLoading} />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-amber-100 border-t-amber-400 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Student & Event</th>
                      <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Rating</th>
                      <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Sentiment</th>
                      <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Feedback Message</th>
                      <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">AI Suggested Reply</th>
                      <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFeedbacks.length > 0 ? filteredFeedbacks.map((f) => (
                      <tr key={f._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-400 text-zinc-950 font-black rounded-full flex items-center justify-center text-xs">
                              {(f.user?.name || 'U').charAt(0)}
                            </div>
                            <div className="space-y-1">
                              <p className="font-black text-zinc-950 text-sm leading-tight tracking-tight">{f.user?.name || 'Unknown'}</p>
                              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{f.event?.title || 'General Event'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex items-center justify-center">
                            <div className="px-3 py-1.5 bg-zinc-950 text-white rounded-xl flex items-center gap-2">
                              <Star size={12} className="text-amber-400 fill-amber-400" />
                              <span className="text-xs font-black">{f.overall?.rating ?? '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8 text-center">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                            f.sentiment === 'Positive' ? 'bg-green-50 text-green-600 border-green-100' :
                            f.sentiment === 'Negative' ? 'bg-red-50 text-red-600 border-red-100' : 
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {getSentimentIcon(f.sentiment)}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {f.sentiment || 'Analyzing...'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <p className="text-sm text-gray-500 leading-relaxed max-w-xs font-medium italic">"{f.overall?.comment || 'No comment provided.'}"</p>
                        </td>
                        <td className="px-8 py-8">
                          <div className="bg-amber-50/50 p-4 rounded-[20px] border border-amber-100/50 max-w-sm group-hover:bg-white group-hover:border-amber-200 transition-all">
                            <p className="text-[11px] text-zinc-700 leading-relaxed font-bold italic">"{f.aiSuggestedReply || 'Generating response...'}"</p>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button 
                              onClick={() => handleSendReply(f)}
                              className="p-3 bg-amber-400 text-zinc-950 rounded-2xl hover:bg-zinc-950 hover:text-white transition-all shadow-lg shadow-amber-200 hover:shadow-zinc-200"
                              title="Send AI Reply"
                            >
                              <Send size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(f._id)}
                              className="p-3 bg-white text-red-500 border border-red-100 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                              title="Delete Feedback"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-4 text-gray-300">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                              <CheckCircle2 size={40} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xl font-black text-zinc-950">No matches found</p>
                              <p className="text-sm font-medium text-gray-400">Try adjusting your filters to see more results.</p>
                            </div>
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
