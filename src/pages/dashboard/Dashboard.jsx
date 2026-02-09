import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import LoadingScreen from "../../components/common/LoadingScreen";

// Lazy load pages
const DashboardHome = lazy(() => import('../Dashboard'));
const BookRide = lazy(() => import('../../components/booking/RideBooking'));
const Analytics = lazy(() => import('../Analytics'));
const Dispatch = lazy(() => import('../Dispatch'));
const MapView = lazy(() => import('../MapView'));
const Profile = lazy(() => import('../Profile'));

/**
 * Dashboard - Main dashboard container using MainLayout
 * All routes under /dashboard/* are rendered here
 */
const Dashboard = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Wrap all dashboard routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="book" element={<BookRide />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="dispatch" element={<Dispatch />} />
          <Route path="map" element={<MapView />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default Dashboard;
