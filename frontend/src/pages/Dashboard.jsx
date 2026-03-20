import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="pt-24 px-4 pb-16">
                <div className="w-full max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Welcome, {user?.name || 'User'}!
                    </h1>
                    <p className="text-gray-600 mb-2">
                        Role: <strong>{user?.role}</strong>
                    </p>
                    <p className="text-gray-600 mb-8">
                        Manage events, view participants, and review feedback.
                    </p>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Link to="/events" className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 transition-colors no-underline">
                            <h2 className="font-semibold text-gray-900 mb-2">🎉 Browse Events</h2>
                            <p className="text-sm text-gray-600">Discover and join upcoming events.</p>
                        </Link>
                        <Link to="/food/pre-order" className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 transition-colors no-underline">
                            <h2 className="font-semibold text-gray-900 mb-2">🍔 Food Pre-Order</h2>
                            <p className="text-sm text-gray-600">Order food for your events in advance.</p>
                        </Link>
                        <Link to="/parking/reserve" className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 transition-colors no-underline">
                            <h2 className="font-semibold text-gray-900 mb-2">🚗 Parking</h2>
                            <p className="text-sm text-gray-600">Reserve a parking slot for your event.</p>
                        </Link>
                        <Link to="/feedback" className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 transition-colors no-underline">
                            <h2 className="font-semibold text-gray-900 mb-2">💬 Feedback</h2>
                            <p className="text-sm text-gray-600">Submit feedback for events you attended.</p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
