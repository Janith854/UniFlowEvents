import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function TicketRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-700">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for ticket logic
  const ticketId = localStorage.getItem('eventTicketId');
  if (!ticketId) {
    // If no ticket, they must register for the event first
    return <Navigate to="/events" replace />;
  }

  return children;
}
