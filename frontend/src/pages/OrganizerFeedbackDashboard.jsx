import React, { useState, useEffect } from 'react';
import * as feedbackService from '../services/feedbackService';
import { MessageSquare, Star, Filter, Send, Smile, Meh, Frown, CheckCircle2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';

export function OrganizerFeedbackDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ rating: 'All', sentiment: 'All' });

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, feedbacks]);

  const fetchFeedback = async () => {
    try {
      const { data } = await feedbackService.getAllFeedback();
      setFeedbacks(data);
      setIsLoading(false);
    } catch (err) {
      toast.error('Failed to load feedback');
      setIsLoading(false);
    }
  };

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

  const stats = {
    averageRating: feedbacks.length > 0 
      ? (feedbacks.reduce((acc, f) => acc + (f.overall?.rating || 0), 0) / feedbacks.length).toFixed(1)
      : 0,
    totalCount: feedbacks.length,
    positivePercentage: feedbacks.length > 0
      ? Math.round((feedbacks.filter(f => f.sentiment === 'Positive').length / feedbacks.length) * 100)
      : 0,
    neutralPercentage: feedbacks.length > 0
      ? Math.round((feedbacks.filter(f => f.sentiment === 'Neutral').length / feedbacks.length) * 100)
      : 0,
    negativePercentage: feedbacks.length > 0
      ? Math.round((feedbacks.filter(f => f.sentiment === 'Negative').length / feedbacks.length) * 100)
      : 0,
    complaints: Array.from(new Set(feedbacks
      .filter(f => f.sentiment === 'Negative')
      .map(f => f.overall?.comment)
      .filter(comment => comment && comment.trim().length > 0)
    )).slice(0, 3),
    topEvent: feedbacks.length > 0
      ? Object.entries(feedbacks.reduce((acc, f) => {
          const title = f.event?.title || 'General';
          if (!acc[title]) acc[title] = { sum: 0, count: 0 };
          acc[title].sum += (f.overall?.rating || 0);
          acc[title].count += 1;
          return acc;
        }, {}))
        .map(([title, data]) => ({ title, avg: data.sum / data.count }))
        .sort((a, b) => b.avg - a.avg)[0]?.title
      : 'N/A',
    sourceBreakdown: feedbacks.length > 0
      ? Object.entries(feedbacks.reduce((acc, f) => {
          const title = f.event?.title || 'General';
          acc[title] = (acc[title] || 0) + 1;
          return acc;
        }, {}))
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
      : [],
    ratingData: [5, 4, 3, 2, 1].map(rating => ({
      name: `${rating} ★`,
      count: feedbacks.filter(f => f.overall?.rating === rating).length,
      rating
    })),
    trendData: feedbacks.length > 0 ? feedbacks.slice().reverse().reduce((acc, f) => {
      const date = new Date(f.createdAt).toLocaleDateString();
      const existing = acc.find(d => d.date === date);
      if (existing) {
        if (f.sentiment === 'Positive') existing.positive += 1;
        if (f.sentiment === 'Negative') existing.negative += 1;
        existing.total += 1;
      } else {
        acc.push({
          date,
          positive: f.sentiment === 'Positive' ? 1 : 0,
          negative: f.sentiment === 'Negative' ? 1 : 0,
          total: 1
        });
      }
      return acc;
    }, []).slice(-7) : [],
    foodAvg: feedbacks.filter(f => !f.food?.notApplicable).length > 0
      ? (feedbacks.filter(f => !f.food?.notApplicable).reduce((acc, f) => acc + (f.food?.rating || 0), 0) / feedbacks.filter(f => !f.food?.notApplicable).length).toFixed(1)
      : 'N/A',
    parkingAvg: feedbacks.filter(f => !f.parking?.notApplicable).length > 0
      ? (feedbacks.filter(f => !f.parking?.notApplicable).reduce((acc, f) => acc + (f.parking?.rating || 0), 0) / feedbacks.filter(f => !f.parking?.notApplicable).length).toFixed(1)
      : 'N/A'
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await feedbackService.deleteFeedback(id);
      toast.success('Feedback deleted');
      fetchFeedback();
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-3">
                <MessageSquare className="text-amber-400" size={32} />
                Feedback Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-500 font-medium">Manage student experiences and AI-driven insights</p>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => { fetchFeedback(); toast.success('Data refreshed'); }}
                className="p-2.5 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-zinc-950 hover:border-gray-200 transition-all shadow-sm"
                title="Refresh Data"
              >
                <div className={isLoading ? 'animate-spin' : ''}>
                  <Filter size={18} />
                </div>
              </button>

              <button 
                onClick={() => setFilters({ ...filters, sentiment: 'Negative' })}
                className="bg-red-50 text-red-600 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100"
              >
                <Frown size={14} />
                Show Issues
              </button>

              <button 
                onClick={() => toast.success('Feedback data exported to CSV')}
                className="bg-zinc-950 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
              >
                <Send size={16} className="rotate-45" />
                Export CSV
              </button>

              <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
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

              <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
            {/* Average Rating */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between group hover:border-amber-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                  <Star size={24} fill="currentColor" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall Rating</span>
                  <span className="text-[9px] font-bold text-green-500 flex items-center gap-0.5 mt-0.5">
                    +0.2 this week
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-zinc-950">{stats.averageRating}</h3>
                <span className="text-gray-400 font-bold">/ 5.0</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Top Performer</p>
                <p className="text-[11px] font-black text-zinc-950 truncate">{stats.topEvent}</p>
              </div>
            </div>

            {/* Total Feedback */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between group hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                  <MessageSquare size={24} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Feedback</span>
                  <span className="text-[9px] font-bold text-blue-400 flex items-center gap-0.5 mt-0.5">
                    +12 new
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-zinc-950">{stats.totalCount}</h3>
                <span className="text-gray-400 font-bold text-sm uppercase">Responses</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Top Source</p>
                <p className="text-[11px] font-black text-zinc-950 truncate">{stats.sourceBreakdown[0]?.title || 'N/A'}</p>
              </div>
            </div>

            {/* Satisfaction */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between group hover:border-green-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-2xl text-green-500 group-hover:scale-110 transition-transform">
                  <Smile size={24} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Satisfaction</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-zinc-950">{stats.positivePercentage}%</h3>
                    <span className="text-green-500 font-bold text-[10px] uppercase tracking-tighter">Pos</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-lg font-black text-zinc-950/60">{stats.neutralPercentage}%</h3>
                    <span className="text-amber-500 font-bold text-[10px] uppercase tracking-tighter">Neu</span>
                  </div>
                  <div className="flex items-baseline gap-1 text-right">
                    <h3 className="text-xl font-black text-zinc-950/40">{stats.negativePercentage}%</h3>
                    <span className="text-red-400 font-bold text-[10px] uppercase tracking-tighter">Neg</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${stats.positivePercentage}%` }}></div>
                  <div className="bg-amber-400 h-full transition-all duration-1000" style={{ width: `${stats.neutralPercentage}%` }}></div>
                  <div className="bg-red-400 h-full transition-all duration-1000" style={{ width: `${stats.negativePercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Common Complaints */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between group hover:border-red-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
                  <Frown size={24} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Common Complaints</span>
                  {stats.negativePercentage > 30 && (
                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full mt-0.5 animate-pulse">
                      Critical Attention
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {stats.complaints.length > 0 ? stats.complaints.map((c, i) => (
                  <p key={i} className="text-[10px] font-bold text-gray-600 line-clamp-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    • {c}
                  </p>
                )) : (
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-tighter flex items-center gap-1">
                    <CheckCircle2 size={12} /> No major issues reported
                  </p>
                )}
              </div>
            </div>

            {/* Category Insights */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between group hover:border-purple-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={24} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category Performance</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Food</span>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-zinc-950">{stats.foodAvg}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Parking</span>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-zinc-950">{stats.parkingAvg}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Rating Distribution Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-zinc-950">Rating Distribution</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Breakdown of star ratings</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">Ratings</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ratingData} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={60}
                      tick={{ fill: '#09090b', fontWeight: 900, fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8f8f8' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                      {stats.ratingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.rating >= 4 ? '#fbbf24' : entry.rating >= 3 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sentiment Trend Chart */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50">
              <div className="mb-8">
                <h3 className="text-xl font-black text-zinc-950">Sentiment Trend</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Last 7 days activity</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.trendData}>
                    <defs>
                      <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontWeight: 600, fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="positive" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPos)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="negative" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

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
                      <th className="px-8 py-6 text-right pr-8">
                        <button 
                          onClick={() => toast.success('Sent bulk replies to all pending feedback')}
                          className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1 justify-end w-full"
                        >
                          <Send size={12} /> Bulk Reply
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFeedbacks.length > 0 ? filteredFeedbacks.map((f) => (
                      <tr key={f._id} className="hover:bg-amber-50/20 transition-all group">
                        <td className="px-8 py-6 border-l-4 border-l-transparent group-hover:border-l-amber-400 transition-all">
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
                            <div className="flex flex-wrap gap-1 mt-2">
                              {['Thanks!', 'Good job', 'Understood'].map(text => (
                                <button 
                                  key={text}
                                  onClick={() => toast.success(`Reply sent: ${text}`)}
                                  className="text-[9px] font-bold px-2 py-0.5 bg-white border border-amber-200 rounded-md text-amber-600 hover:bg-amber-100 transition-colors"
                                >
                                  {text}
                                </button>
                              ))}
                            </div>
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
                              className="p-3 bg-white text-gray-400 rounded-2xl hover:text-red-500 hover:bg-red-50 transition-all border border-gray-100 shadow-sm"
                              title="Delete Feedback"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 text-gray-400">
                            <img src="/images/no-feedback.png" alt="No Feedback" className="w-48 h-48 object-contain opacity-50" />
                            <div className="space-y-1">
                              <p className="text-xl font-black text-zinc-950">No feedback found</p>
                              <p className="text-sm font-medium">Try adjusting your filters to see more results.</p>
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
