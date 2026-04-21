import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export function GlobalSocketListener() {
  const { user } = useAuth();

  useEffect(() => {
    // Connect to Backend universally
    const socket = io('http://localhost:5002', {
      withCredentials: true,
    });

    socket.on('food-order-status-changed', (order) => {
      // Validate if the updated broadcast order securely belongs exactly to this logged-in client
      if (user && (order.user === user.id || order.user === user._id)) {
        if (order.status === 'Ready') {
          toast.success(
            `🚀 Your food order ending in ${order._id.slice(-4)} is READY for pickup at ${order.pickupSlot}!`,
            { duration: 10000, position: 'top-right', style: { border: '2px solid #10b981', padding: '16px', color: '#065f46', fontWeight: 'bold' } }
          );
        } else if (order.status === 'Picked Up') {
          toast(
            `🍔 Your order was picked up. Enjoy!`,
            { duration: 8000, position: 'top-right', style: { border: '2px solid #8b5cf6', padding: '16px', color: '#4c1d95', fontWeight: 'bold' } }
          );
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return <Toaster />;
}
