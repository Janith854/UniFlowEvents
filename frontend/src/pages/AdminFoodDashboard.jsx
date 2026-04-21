import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getFoodOrders, updateFoodOrder } from '../services/foodService';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

export function AdminFoodDashboard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stallFilter, setStallFilter] = useState('All Stalls');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getFoodOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('Food orders fetch error:', err);
      if (err.response?.status === 401) {
        setError('⚠️ Not authorized. Please make sure you are logged in as an organizer.');
      } else {
        setError(`Failed to fetch orders: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Setup Socket connection
    const socketURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';
    const socket = io(socketURL, { path: '/socket.io' });

    socket.on('connect', () => {
      console.log('AdminFoodDashboard connected to socket:', socket.id);
    });

    socket.on('food-order-status-changed', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      toast.success(`Order ${updatedOrder._id.substring(updatedOrder._id.length - 6)} status updated to ${updatedOrder.status}`);
    });

    socket.on('food-order-payment-confirmed', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      toast.success(`Order ${updatedOrder._id.substring(updatedOrder._id.length - 6)} payment confirmed!`);
    });

    // Also listen to new orders
    // Actually, createFoodOrder doesn't emit an event currently, but we can just poll or rely on status updates.
    // For now, updating status and payments is real-time.

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStatusToggle = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Ready' 
                     : currentStatus === 'Ready' ? 'Picked Up' 
                     : 'Pending';
    try {
      await updateFoodOrder(orderId, { status: nextStatus });
      // We don't strictly need to fetchOrders because socket will emit 'food-order-status-changed' and update it,
      // but we can optimistic update or just let socket handle it. Let's let socket handle it, but also do it here for instant feedback.
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: nextStatus } : o));
      toast.success('Status updated successfully');
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status.');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(o => {
    // Stall filter
    const matchesStall = stallFilter === 'All Stalls' || o.items.some(i => (i.stallNumber || '').includes(stallFilter));
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      o._id.toLowerCase().includes(searchLower) || 
      (o.ticketId && o.ticketId.toLowerCase().includes(searchLower)) ||
      (o.qrString && o.qrString.toLowerCase().includes(searchLower));
      
    return matchesStall && matchesSearch;
  });

  const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const stallDataMap = {};
  filteredOrders.forEach(order => {
     order.items.forEach(item => {
        const stall = item.stallNumber || 'General Stall';
        if (!stallDataMap[stall]) stallDataMap[stall] = 0;
        stallDataMap[stall] += (item.price * item.quantity);
     });
  });
  const revenueData = Object.keys(stallDataMap).map(key => ({ name: key, value: stallDataMap[key] }));
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

  const statusMap = { 'Pending': 0, 'Ready': 0, 'Picked Up': 0 };
  filteredOrders.forEach(order => {
      if (statusMap[order.status] !== undefined) statusMap[order.status]++;
  });
  const statusData = Object.keys(statusMap).map(key => ({ name: key, count: statusMap[key] }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-black text-gray-900">Admin Food Dashboard</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <input 
                type="text"
                placeholder="Search Order ID / Ticket"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-amber-500 w-64 shadow-sm"
              />
              <select 
                value={stallFilter}
                onChange={(e) => setStallFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              >
                <option value="All Stalls">All Stalls</option>
                <option value="Stall 1">Stall 1 (Hot Meals)</option>
                <option value="Stall 2">Stall 2 (Quick Bites)</option>
                <option value="Stall 3">Stall 3 (Desserts & Sweets)</option>
                <option value="Stall 4">Stall 4 (Beverages Bar)</option>
              </select>
              <div className="bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-gray-500 font-bold mr-2">Total Sales:</span>
                <span className="text-2xl font-black text-amber-500">Rs. {totalSales.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 text-lg">Revenue by Stall Distribution</h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={revenueData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                         {revenueData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                       </Pie>
                       <Tooltip formatter={(value) => `Rs. ${value.toFixed(2)}`} />
                     </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 text-lg">Order Fulfillment Flow</h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                       <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 12, fontWeight: 'bold'}} />
                       <YAxis stroke="#6b7280" />
                       <Tooltip cursor={{ fill: '#f3f4f6' }} />
                       <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          {error && <p className="text-red-500 bg-red-50 p-4 rounded-xl mb-4 font-bold border border-red-100">{error}</p>}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                    <th className="p-4 font-bold">Order ID / QR</th>
                    <th className="p-4 font-bold">User / Ticket</th>
                    <th className="p-4 font-bold">Items</th>
                    <th className="p-4 font-bold text-center">Payment Info</th>
                    <th className="p-4 font-bold text-right">Total</th>
                    <th className="p-4 font-bold text-center">Pickup Slot</th>
                    <th className="p-4 font-bold text-center">Fulfillment</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading orders...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan="6" className="p-4 text-center text-gray-500">No orders found.</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <p className="font-mono text-xs text-gray-500">{order._id.substring(order._id.length - 6)}</p>
                          <p className="font-bold text-gray-900 text-sm mt-1">{order.qrString}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">Ticket: {order.ticketId}</p>
                        </td>
                        <td className="p-4">
                          <ul className="text-sm text-gray-600 space-y-1">
                            {order.items.map((i, idx) => (
                              <li key={idx} className="flex flex-col gap-1 mb-2">
                                {i.image && (
                                  <img
                                    src={i.image}
                                    alt={i.name}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                                    onError={(e) => { 
                                      e.target.onerror = null; 
                                      e.target.src = 'https://placehold.co/100x100?text=Food';
                                    }}
                                  />
                                )}
                                <span><span className="font-bold text-gray-900">{i.quantity}x</span> {i.name}</span>
                                <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 inline-block w-max px-1 rounded">{i.stallNumber || 'General Stall'}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-4 text-center">
                          <div className={`inline-flex flex-col items-center justify-center p-2 rounded-xl border ${
                            order.paymentMethod === 'Card' ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'
                          }`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              order.paymentMethod === 'Card' ? 'text-indigo-600' : 'text-emerald-600'
                            }`}>{order.paymentMethod || 'Unknown'}</span>
                            <span className={`text-xs font-bold mt-1 ${
                              order.paymentStatus === 'Paid' ? 'text-green-600' : 
                              order.paymentStatus === 'Pay at Counter' ? 'text-amber-600' : 'text-gray-500'
                            }`}>{order.paymentStatus || 'Pending'}</span>
                          </div>
                        </td>
                        <td className="p-4 font-black text-gray-900 text-right">Rs. {order.totalAmount.toFixed(2)}</td>
                        <td className="p-4 font-bold text-gray-700 text-center">{order.pickupSlot}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleStatusToggle(order._id, order.status)}
                            className={`px-4 py-2 w-28 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 border ${
                              order.status === 'Ready' ? 'bg-green-400 text-white border-green-500/20 hover:bg-green-500' :
                              order.status === 'Picked Up' ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed shadow-none' :
                              'bg-amber-400 text-zinc-950 border-amber-500/20 hover:bg-amber-300'
                            }`}
                            disabled={order.status === 'Picked Up'}
                          >
                            {order.status}
                          </button>
                          {order.status !== 'Picked Up' && <p className="text-[10px] text-gray-400 mt-1">Click to toggle</p>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminFoodDashboard;
