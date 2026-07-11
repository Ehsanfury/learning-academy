/**
 * AdminPage.jsx
 * Path: src/pages/Admin/AdminPage.jsx
 * Description: Admin panel main entry point
 */

import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "../../router/AdminRoute";
import AdminLayout from "../../layouts/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";

// Lazy load admin pages
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AdminUsers = lazy(() => import("./AdminUsers"));
const AdminLessons = lazy(() => import("./AdminLessons"));
const AdminExercises = lazy(() => import("./AdminExercises"));
const AdminAchievements = lazy(() => import("./AdminAchievements"));

// ✅ New admin pages (will be added later)
// const AdminAnalytics = lazy(() => import("./AdminAnalyticsPage"));
// const AdminTickets = lazy(() => import("./AdminTicketsPage"));
// const AdminSettings = lazy(() => import("./AdminSettingsPage"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

function AdminPage() {
  return (
    <AdminRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="lessons" element={<AdminLessons />} />
            <Route path="exercises" element={<AdminExercises />} />
            <Route path="achievements" element={<AdminAchievements />} />
            {/* <Route path="analytics" element={<AdminAnalytics />} /> */}
            {/* <Route path="tickets" element={<AdminTickets />} /> */}
            {/* <Route path="settings" element={<AdminSettings />} /> */}
          </Routes>
        </Suspense>
      </AdminLayout>
    </AdminRoute>
  );
}

export default AdminPage;
