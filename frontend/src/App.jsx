import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ProfilePage } from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { EventPage } from './pages/EventPage';
import { FoodPage } from './pages/FoodPage';
import { FoodPreOrder } from './pages/FoodPreOrder';
import { ParkingPage } from './pages/ParkingPage';
import { ParkingReservation } from './pages/ParkingReservation';
import { Feedback } from './pages/Feedback';
import { FeedbackPage } from './pages/FeedbackPage';
import { UserManagementPage } from './pages/UserManagement';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="organizer">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRole="organizer">
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route
          path="/food/pre-order"
          element={
            <ProtectedRoute>
              <FoodPreOrder />
            </ProtectedRoute>
          }
        />
        <Route path="/parking" element={<ParkingPage />} />
        <Route
          path="/parking/reserve"
          element={
            <ProtectedRoute>
              <ParkingReservation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback/:eventId"
          element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
