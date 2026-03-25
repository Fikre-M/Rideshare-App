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
const Settings = lazy(() => import('../Settings'));

/**
 * Dashboard - Main dashboard container using MainLayout
 * All routes under /dashboard/* are rendered here
 */
const Dashboard = () => {
  return (
    <Routes>
      {/* Wrap all dashboard routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route index element={
          <Suspense fallback={<LoadingScreen message="Loading..." size="medium" />}>
            <DashboardHome />
          </Suspense>
        } />
        <Route path="book" element={
          <Suspense fallback={<LoadingScreen message="Loading..." size="medium" />}>
            <BookRide />
          </Suspense>
        } />
        <Route path="analytics" element={
          <Suspense fallback={<LoadingScreen message="Loading..." size="medium" />}>
            <Analytics />
          </Suspense>
        } />
        <Route path="dispatch" element={
          <Suspense fallback={<LoadingScreen message="Loading..." size="medium" />}>
            <Dispatch />
          </Suspense>
        } />
        <Route path="map" element={
          <Suspense fallback={<LoadingScreen message="Loading..." size="medium" />}>
            <MapView />
          </Suspense>
        } />
        <Route path="profile" element={
          <Suspense fallback={<LoadingScreen message="Loading..." size="medium" />}>
            <Profile />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<LoadingScreen message="Loading..." size="medium" />}>
            <Settings />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;
