import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Link } from 'react-router-dom';
import * as feedbackService from '../services/feedbackService';
import {
  User, Mail, Shield, Star, Settings, Key, Users,
  MessageSquare, AlertTriangle, CheckCircle, Camera,
  Send, History, MessageCircle
} from 'lucide-react';

const getRoleColor = (role) => {
  if (role === 'organizer') return { bg: 'from-violet-500 to-indigo-600', badge: 'bg-violet-100 text-violet-700', ring: 'ring-violet-400' };
  return { bg: 'from-amber-400 to-orange-500', badge: 'bg-amber-100 text-amber-700', ring: 'ring-amber-400' };
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export function ProfilePage() {
  const { user, role, updateProfile, updatePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});
  const feedbackReplies = (user?.inbox || []).filter((item) => item.type === 'feedback-reply');
  const joinedYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : '---';

  const colors = getRoleColor(role);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    if (role === 'student') fetchMyFeedback();
  }, [user]);

  const fetchMyFeedback = async () => {
    try {
      const { data } = await feedbackService.getMyFeedback();
      setMyFeedbacks(data);
    } catch (err) {
      console.error('Failed to load feedback history');
    }
  };

  const handleReplySubmit = async (feedbackId) => {
    const text = replyTexts[feedbackId];
    if (!text?.trim()) return;
    try {
      await feedbackService.replyToFeedback(feedbackId, text);
      setReplyTexts({ ...replyTexts, [feedbackId]: '' });
      fetchMyFeedback();
      showStatus('Reply sent successfully! ✓');
    } catch (err) {
      showStatus('Failed to send reply.', true);
    }
  };

  const showStatus = (msg, isError = false) => {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 4000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email });
      showStatus('Profile updated successfully! ✓');
    } catch (err) {
      showStatus(err.response?.data?.msg || 'Failed to update profile.', true);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showStatus('New passwords do not match.', true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showStatus('Password changed successfully! ✓');
    } catch (err) {
      showStatus(err.response?.data?.msg || 'Failed to change password.', true);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure? Your account will be deactivated and you will be logged out.')) return;
    try {
      const { default: API } = await import('../services/api');
      await API.patch(`/users/${user.id}/deactivate`);
      showStatus('Account deactivated. Redirecting...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err) {
      showStatus('Failed to deactivate account.', true);
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all placeholder-gray-400";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Header */}
      <div className={`w-full bg-gradient-to-br ${colors.bg} pt-24 pb-32`}>
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center gap-4">
          {/* Avatar */}
          <div className={`relative w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center ring-4 ring-white/40 shadow-2xl`}>
            <span className="text-3xl font-black text-white">{getInitials(user?.name)}</span>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Name + Role */}
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{user?.name || 'UniFlow User'}</h1>
            <p className="text-white/70 text-sm mt-1">{user?.email}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur`}>
            <Shield className="w-3 h-3" />
            {role === 'organizer' ? 'Organizer' : 'Student'}
          </span>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-2">
            {[
              { label: 'Events', value: String(user?.eventsAttended ?? 0), icon: Star },
              { label: 'Replies', value: String(feedbackReplies.length), icon: MessageSquare },
              { label: 'Since', value: String(joinedYear), icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1 text-white/60 text-xs">
                  <Icon className="w-3 h-3" /> {label}
                </div>
                <span className="text-white font-black text-xl leading-none">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="-mt-16 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Status Toasts */}
          {message && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-5 py-4 rounded-2xl shadow-sm">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              {message}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-5 py-4 rounded-2xl shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Organizer Quick Link */}
          {role === 'organizer' && (
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-bold text-violet-900 text-sm">Admin Tools</p>
                  <p className="text-violet-600 text-xs">Manage users and permissions</p>
                </div>
              </div>
              <Link to="/users" className="px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-sm">
                Open Panel →
              </Link>
            </div>
          )}

          {/* Tab Cards */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {[
                { id: 'edit', label: 'Edit Profile', icon: Settings },
                { id: 'password', label: 'Security', icon: Key },
                { id: 'feedback', label: 'My Feedback', icon: MessageCircle },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black transition-all ${
                    activeTab === id
                      ? 'text-zinc-950 bg-amber-400 shadow-inner'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'edit' && (
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Your full name"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="you@university.edu"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button type="submit" className="px-8 py-3 bg-amber-400 text-zinc-950 font-bold rounded-xl hover:bg-amber-300 transition-all shadow-md shadow-amber-100 hover:shadow-lg hover:shadow-amber-200 active:scale-95">
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div>
                    <label className={labelClass}>Current Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="Enter current password"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>New Password</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="Min. 6 characters"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Confirm New Password</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Repeat new password"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button type="submit" className="px-8 py-3 bg-amber-400 text-zinc-950 font-black rounded-xl hover:bg-amber-300 transition-all shadow-md shadow-amber-200 active:scale-95">
                      Update Password
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'feedback' && (
                <div className="space-y-8">
                  {myFeedbacks.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm font-medium">You haven't submitted any feedback yet.</p>
                      <Link to="/feedback" className="text-amber-500 font-bold text-xs uppercase tracking-widest mt-2 inline-block hover:underline">Submit Feedback →</Link>
                    </div>
                  ) : (
                    myFeedbacks.map((f) => (
                      <div key={f._id} className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-gray-100 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-black text-zinc-950 text-base">{f.event?.title || 'Event Feedback'}</h4>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{f.event?.location || 'General Location'}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                              <Star size={12} className="text-amber-500 fill-amber-500" />
                              <span className="text-xs font-black text-amber-700">{f.overall?.rating || '0'}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                            "{f.overall?.comment || 'No comment provided.'}"
                          </p>
                        </div>
                        
                        <div className="p-5 space-y-4">
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <MessageCircle size={12} /> Conversation History
                          </h5>
                          
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shrink-0 font-black text-[10px] text-white shadow-sm ring-2 ring-white">ORG</div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[85%]">
                              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                {f.aiSuggestedReply || 'Thank you for your feedback! We will review it shortly.'}
                              </p>
                              <span className="text-[9px] text-gray-400 font-bold uppercase mt-2 block tracking-widest opacity-60">Organizer • Auto-Reply</span>
                            </div>
                          </div>

                          {f.replies?.map((r, i) => (
                            <div key={i} className={`flex gap-3 ${r.user === user.id ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-[10px] text-white shadow-sm ring-2 ring-white ${r.user === user.id ? 'bg-zinc-950' : 'bg-amber-400'}`}>
                                {r.user === user.id ? 'YOU' : 'ORG'}
                              </div>
                              <div className={`bg-white border border-gray-100 p-4 shadow-sm max-w-[85%] ${r.user === user.id ? 'rounded-2xl rounded-tr-none bg-amber-50/30' : 'rounded-2xl rounded-tl-none'}`}>
                                <p className="text-sm text-gray-700 leading-relaxed">{r.message}</p>
                                <span className="text-[9px] text-gray-400 font-bold uppercase mt-2 block tracking-widest opacity-60 text-right">
                                  {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))}

                          <div className="mt-6 flex items-center gap-3">
                            <input 
                              type="text" 
                              placeholder="Type your reply here..."
                              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all shadow-inner"
                              value={replyTexts[f._id] || ''}
                              onChange={(e) => setReplyTexts({ ...replyTexts, [f._id]: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit(f._id)}
                            />
                            <button 
                              onClick={() => handleReplySubmit(f._id)}
                              disabled={!replyTexts[f._id]?.trim()}
                              className="p-3 bg-amber-400 text-zinc-950 rounded-xl hover:bg-amber-300 transition-all shadow-md shadow-amber-100 disabled:opacity-50 disabled:grayscale"
                            >
                              <Send size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-gray-900">Feedback Replies</h3>
            </div>
            <div className="p-6 space-y-4">
              {feedbackReplies.length === 0 ? (
                <p className="text-sm text-gray-500">No feedback replies yet.</p>
              ) : (
                feedbackReplies
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((item) => (
                    <div key={item._id || item.createdAt} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-900">{item.title || 'Feedback reply'}</p>
                        <span className="text-xs text-gray-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{item.message}</p>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-red-800 text-base">Danger Zone</h3>
                <p className="text-red-500 text-sm mt-1 mb-4">
                  Deactivating your account is reversible only by contacting support. Your data will be preserved but login will be disabled.
                </p>
                <button
                  onClick={handleDeactivate}
                  className="px-6 py-2.5 bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-all shadow-md shadow-amber-200 border-2 border-red-500/20 active:scale-95"
                >
                  Deactivate Account
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
