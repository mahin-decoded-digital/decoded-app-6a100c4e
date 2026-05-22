import '@/styles/theme.css';
import '@/styles/brand.css';

import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ProtectedRoute } from '@/components/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/PricingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import OnboardingPage from '@/pages/OnboardingPage';
import BookingPage from '@/pages/BookingPage';
import NotFoundPage from '@/pages/NotFoundPage';

import CalendarPage from '@/pages/dashboard/CalendarPage';
import BookingsPage from '@/pages/dashboard/BookingsPage';
import CustomersPage from '@/pages/dashboard/CustomersPage';
import ResourcesPage from '@/pages/dashboard/ResourcesPage';
import ReportsPage from '@/pages/dashboard/ReportsPage';
import BrandingPage from '@/pages/dashboard/BrandingPage';
import OperationsPage from '@/pages/dashboard/OperationsPage';
import PricingSettingsPage from '@/pages/dashboard/PricingSettingsPage';
import BillingPage from '@/pages/dashboard/BillingPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';

import AdminPage from '@/pages/AdminPage';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public marketing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Onboarding (protected) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Manager dashboard (protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/customers"
          element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/resources"
          element={
            <ProtectedRoute>
              <ResourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/branding"
          element={
            <ProtectedRoute>
              <BrandingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/operations"
          element={
            <ProtectedRoute>
              <OperationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/pricing"
          element={
            <ProtectedRoute>
              <PricingSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/billing"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Platform admin (protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Customer booking pages — per-club */}
        <Route path="/book/:slug" element={<BookingPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster richColors position="top-right" />
    </>
  );
}
