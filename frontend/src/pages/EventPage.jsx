import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import axios from 'axios';

export function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticketStatus, setTicketStatus] = useState(null);
  const [rewardMsg, setRewardMsg] = useState('');

  const generateTicket = async () => {
    try {
      const token = localStorage.getItem('uniflow_auth') ? JSON.parse(localStorage.getItem('uniflow_auth')).token : null;
      if (!token) {
         alert("Please login first!");
         navigate('/login');
         return;
      }
      
      const res = await axios.post(`http://localhost:5001/api/events/${id}/ticket`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('eventTicketId', res.data.ticketId);
      localStorage.setItem('eventId', id);
      
      setTicketStatus(res.data);
      if (res.data.rewardIssued) {
         setRewardMsg("🎉 5-Event Loyalty Reward Unlocked! A free snack voucher has been heavily deposited into your account!");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Could not generate ticket');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 px-4 pb-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Event Registration
          </h1>
          <p className="text-gray-600 mb-8 font-medium text-lg">
            Generating a ticket strictly registers your attendance securely to Event ID: <strong>{id}</strong>.
          </p>
          
          {rewardMsg && (
            <div className="mb-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-4 rounded-xl shadow-md font-bold text-lg animate-bounce-slow">
              {rewardMsg}
            </div>
          )}

          {ticketStatus ? (
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
               <h3 className="text-2xl font-bold text-green-700 mb-2">Ticket Generated!</h3>
               <p className="text-gray-800 font-mono text-xl mb-4 bg-white p-3 rounded border border-gray-200">{ticketStatus.ticketId}</p>
               <p className="text-gray-600 font-medium mb-6">Total Events Attended: <strong>{ticketStatus.eventsAttended}</strong></p>
               <button onClick={() => navigate('/food')} className="bg-amber-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-500 transition-colors shadow-sm">
                 Proceed to Food Court
               </button>
            </div>
          ) : (
            <button onClick={generateTicket} className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm text-lg w-full max-w-xs">
              Generate Free Ticket
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

