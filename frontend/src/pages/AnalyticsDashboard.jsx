import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { getEvents } from '../services/eventService';
import { getParkingAnalytics } from '../services/parkingService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AnalyticsDashboard() {
  const [events, setEvents] = useState([]);
  const [parkingStats, setParkingStats] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: eventData } = await getEvents();
      setEvents(eventData);
      
      const { data: parkData } = await getParkingAnalytics();
      setParkingStats(parkData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  // Prepare Data for Revenue Chart
  const revenueData = events.map(e => {
    const attendees = e.participants?.length || 0;
    const ticketPrice = e.ticketing?.regularPrice || 0;
    return {
      name: e.title,
      revenue: attendees * ticketPrice
    };
  });

  // Prepare Data for Capacity Usage Pie Chart
  let totalCapacity = 0;
  let totalFilled = 0;
  events.forEach(e => {
    totalCapacity += e.capacity || 0;
    totalFilled += e.participants?.length || 0;
  });
  
  const capacityData = [
    { name: 'Filled Seats', value: totalFilled },
    { name: 'Empty Seats', value: Math.max(0, totalCapacity - totalFilled) }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">University Analytics</h1>
          <p className="mt-2 text-gray-600">Cross-module insights for CampusFlow organizers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Event Revenue (LKR)</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="revenue" fill="#fbbf24" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Capacity Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Seating Occupancy</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={capacityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {capacityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Parking Utilization Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h2 className="text-xl font-bold text-gray-900 mb-2">Parking Utilization Overview</h2>
           <p className="text-gray-500 text-sm mb-8">Real-time occupancy across North and South campus zones.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2 h-64">
                <ResponsiveContainer>
                    <BarChart data={parkingStats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="#18181b" radius={[0, 10, 10, 0]} barSize={30} label={{ position: 'right', fill: '#18181b', fontWeight: 'bold' }} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                 {parkingStats.map((stat, i) => (
                    <div key={stat.name} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.name}</p>
                        <p className="text-2xl font-black text-zinc-950">{stat.value} Slots</p>
                    </div>
                 ))}
              </div>
           </div>
            </div>
          </div>
    </div>
  );
}
