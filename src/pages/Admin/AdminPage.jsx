/**
 * AdminPage.jsx
 * Path: src/pages/Admin/AdminPage.jsx
 * Description: Admin panel main entry point
 * Changes:
 * - ✅ FIXED: Removed duplicate AdminRoute (handled in App.jsx)
 * - ✅ FIXED: AdminLayout now wraps Routes correctly
 */

import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";

// Lazy load admin pages
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AdminUsers = lazy(() => import("./AdminUsers"));
const AdminLessons = lazy(() => import("./AdminLessons"));
const AdminExercises = lazy(() => import("./AdminExercises"));
const AdminAchievements = lazy(() => import("./AdminAchievements"));
const AdminStats = lazy(() => import("./AdminDashboard"));
const AdminTickets = lazy(() => import("./AdminTicketsPage"));
const AdminSettings = lazy(() => import("./AdminSettingsPage"));
const AdminAnalytics = lazy(() => import("./AdminAnalyticsPage"));
const AdminLogs = lazy(() => import("./AdminLogsPage"));
const AdminMentors = lazy(() => import("./AdminMentorsPage"));
const AdminNotifications = lazy(() => import("./AdminNotificationsPage"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

function AdminPage() {
  console.log("📄 AdminPage rendered");

  return (
    <AdminLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="lessons" element={<AdminLessons />} />
          <Route path="exercises" element={<AdminExercises />} />
          <Route path="achievements" element={<AdminAchievements />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="mentors" element={<AdminMentors />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="*" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
}

export default AdminPage;
