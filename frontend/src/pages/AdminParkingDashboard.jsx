import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LayoutDashboard, Car, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

export function AdminParkingDashboard() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('uniflow_auth') ? JSON.parse(localStorage.getItem('uniflow_auth')).token : null;
      const res = await axios.get('http://localhost:5002/api/parking/analytics', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setAnalytics(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch parking analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#fbbf24', '#18181b', '#71717a'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Organizer Tools</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Parking Analytics</h1>
            </div>
            <button 
              onClick={fetchAnalytics}
              className="flex items-center gap-2 bg-white border-2 border-gray-100 hover:border-amber-400 px-6 py-3 rounded-2xl font-bold text-gray-700 transition-all active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
              <AlertCircle className="w-6 h-6" />
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analytics.map((item, idx) => (
              <motion.div 
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-amber-400 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-amber-400 transition-colors">
                    <Car className="w-6 h-6 text-gray-400 group-hover:text-zinc-950" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider">{item.name}</h3>
                <p className="text-4xl font-black text-gray-900 mt-1">{item.value}</p>
                <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(item.value / 50) * 100}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-zinc-900 p-6 rounded-3xl shadow-xl shadow-gray-200/50 flex flex-col justify-between"
              >
                <h3 className="text-amber-400 font-black text-lg uppercase tracking-wider">Total Occupancy</h3>
                <div>
                  <p className="text-6xl font-black text-white">{analytics.reduce((acc, curr) => acc + curr.value, 0)}</p>
                  <p className="text-zinc-400 font-bold mt-2">Active Reservations Across All Zones</p>
                </div>
              </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-amber-400 rounded-full"></span>
                Zonal Distribution
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {analytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-zinc-950 rounded-full"></span>
                Occupancy Comparisons
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminParkingDashboard;
