import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TicketRoute } from './components/TicketRoute';
import { GlobalSocketListener } from './components/GlobalSocketListener';
import { Home } from './pages/Home';
import { LoginPage } from './pages/Login';
import { HomePage } from './pages/HomePage'; // Just in case, checking names
import { ProfilePage } from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { EventPage } from './pages/EventPage';
import { FoodPage } from './pages/FoodPage';
import { AdminFoodDashboard } from './pages/AdminFoodDashboard';
import { AdminInventoryDashboard } from './pages/AdminInventoryDashboard';
import { ParkingPage } from './pages/ParkingPage';
import { ParkingReservation } from './pages/ParkingReservation';
import { ResetPassword } from './pages/ResetPassword';
import { ForgotPassword } from './pages/ForgotPassword';
import { OrganizerFeedbackDashboard } from './pages/OrganizerFeedbackDashboard';
import { Feedback } from './pages/Feedback';
import { FeedbackPage } from './pages/FeedbackPage';
import { UserManagementPage } from './pages/UserManagement';
import { CalendarView } from './pages/CalendarView';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { ApprovalQueue } from './pages/ApprovalQueue';
import { CreateEvent } from './pages/CreateEvent';
import { DigitalPass } from './pages/DigitalPass';
import { AdminParkingDashboard } from './pages/AdminParkingDashboard';
import { EditEvent } from './pages/EditEvent';

export function App() {
  return (
    <AuthProvider>
      <GlobalSocketListener />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
        <Route path="/calendar" element={<CalendarView />} />
        <Route
          path="/events/create"
          element={
            <ProtectedRoute requiredRole="organizer">
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute requiredRole="organizer">
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredRole="organizer">
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals"
          element={
            <ProtectedRoute requiredRole="organizer">
              <ApprovalQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food"
          element={
            <TicketRoute>
              <FoodPage />
            </TicketRoute>
          }
        />
        <Route
          path="/parking"
          element={
            <ProtectedRoute>
              <ParkingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parking/reservation"
          element={
            <ProtectedRoute>
              <ParkingReservation />
            </ProtectedRoute>
          }
        />
        <Route path="/parking/success" element={<DigitalPass />} />
        <Route
          path="/admin/food"
          element={
            <ProtectedRoute requiredRole="organizer">
              <AdminFoodDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute requiredRole="organizer">
              <AdminInventoryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerFeedbackDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parking"
          element={
            <ProtectedRoute requiredRole="organizer">
              <AdminParkingDashboard />
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
