import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
      const authToken = token || (localStorage.getItem('uniflow_auth') ? JSON.parse(localStorage.getItem('uniflow_auth')).token : null);
      const res = await axios.get('http://localhost:5001/api/food', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      setOrders(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Ready' 
                     : currentStatus === 'Ready' ? 'Picked Up' 
                     : 'Pending';
    try {
      const authToken = token || (localStorage.getItem('uniflow_auth') ? JSON.parse(localStorage.getItem('uniflow_auth')).token : null);
      await axios.put(`http://localhost:5001/api/food/${orderId}`, 
        { status: nextStatus },
        { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} }
      );
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status.');
    }
  };

  const filteredOrders = stallFilter === 'All Stalls' 
    ? orders 
    : orders.filter(o => o.items.some(i => (i.stallNumber || '').includes(stallFilter)));

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
              <select 
                value={stallFilter}
                onChange={(e) => setStallFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-amber-500"
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
                    <th className="p-4 font-bold">Total</th>
                    <th className="p-4 font-bold">Pickup Slot</th>
                    <th className="p-4 font-bold text-center">Status</th>
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
                              <li key={idx} className="flex flex-col">
                                <span><span className="font-bold text-gray-900">{i.quantity}x</span> {i.name}</span>
                                <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 inline-block w-max px-1 rounded">{i.stallNumber || 'General Stall'}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-4 font-bold text-gray-900">Rs. {order.totalAmount.toFixed(2)}</td>
                        <td className="p-4 font-medium text-gray-700">{order.pickupSlot}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleStatusToggle(order._id, order.status)}
                            className={`px-4 py-2 w-28 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
                              order.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200' :
                              order.status === 'Ready' ? 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200' :
                              'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                            }`}
                          >
                            {order.status}
                          </button>
                          <p className="text-[10px] text-gray-400 mt-1">Click to toggle</p>
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
