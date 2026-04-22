import React from 'react';
import { Star, MessageSquare, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export function FeedbackStats({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-white/50 backdrop-blur-xl rounded-[40px] border border-white animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats || totalFeedback === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-xl p-12 rounded-[40px] border border-white border-dashed mb-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MessageSquare size={32} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-black text-zinc-950 mb-2">No feedback analytics yet</h3>
        <p className="text-gray-500 max-w-xs font-medium">As soon as students start submitting reviews, you'll see live insights here.</p>
      </div>
    );
  }

  const { averageRating, totalFeedback, satisfaction, commonComplaints } = stats;
  const positivePercentage = totalFeedback > 0 ? Math.round((satisfaction.positive / totalFeedback) * 100) : 0;
  const negativePercentage = totalFeedback > 0 ? Math.round((satisfaction.negative / totalFeedback) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Average Rating Card */}
      <div className="relative group bg-white/70 backdrop-blur-2xl p-8 rounded-[40px] border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(251,191,36,0.15)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-400/30 transition-all duration-700 group-hover:scale-150" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-amber-400 text-zinc-950 rounded-2xl shadow-lg shadow-amber-200 group-hover:rotate-12 transition-transform duration-500">
              <Star fill="currentColor" size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Average Rating</span>
          </div>
          <div className="flex items-end gap-2">
            <h2 className="text-5xl font-black text-zinc-950 tracking-tighter group-hover:scale-110 origin-left transition-transform duration-500">{averageRating || 0}</h2>
            <span className="text-xl font-bold text-gray-400 mb-2">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Total Feedback Card */}
      <div className="relative group bg-white/70 backdrop-blur-2xl p-8 rounded-[40px] border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(129,140,248,0.15)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-400/30 transition-all duration-700 group-hover:scale-150" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform duration-500">
              <MessageSquare size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Response</span>
          </div>
          <h2 className="text-5xl font-black text-zinc-950 tracking-tighter group-hover:scale-110 origin-left transition-transform duration-500">{totalFeedback || 0}</h2>
        </div>
      </div>

      {/* Satisfaction Card */}
      <div className="relative group bg-white/70 backdrop-blur-2xl p-8 rounded-[40px] border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(34,197,94,0.15)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-green-400/30 transition-all duration-700 group-hover:scale-150" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-100 group-hover:rotate-12 transition-transform duration-500">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Satisfaction</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Positive</span>
                <span className="text-sm font-black text-green-600 tracking-tighter">{positivePercentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                  style={{ width: `${positivePercentage}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Negative</span>
                <span className="text-sm font-black text-red-600 tracking-tighter">{negativePercentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                  style={{ width: `${negativePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Card */}
      <div className="relative group bg-white/70 backdrop-blur-2xl p-8 rounded-[40px] border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(239,68,68,0.15)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-400/30 transition-all duration-700 group-hover:scale-150" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-100 group-hover:rotate-12 transition-transform duration-500">
              <AlertCircle size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Top Complaints</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonComplaints && commonComplaints.length > 0 ? (
              commonComplaints.map((c, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100/50 hover:bg-red-100 transition-colors cursor-default group/tag hover:scale-105 transition-transform">
                  <span className="text-[10px] font-black uppercase tracking-widest">{c.keyword}</span>
                  <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-md min-w-[18px] text-center shadow-sm">{c.count}</span>
                </div>
              ))
            ) : (
              <span className="text-xs font-bold text-gray-400 italic">No major issues reported</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
