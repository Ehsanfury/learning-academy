/**
 * PublicRoute.jsx
 * Path: src/router/PublicRoute.jsx
 * Description: Public route guard - redirects to dashboard if already authenticated
 * Changes:
 * - NEW: Created for login/register pages
 * - Prevents authenticated users from accessing login/register
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

/**
 * PublicRoute Component
 * Protects public routes (login, register) from authenticated users
 *
 * Usage:
 * <Route element={<PublicRoute><Login /></PublicRoute>} />
 */
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the children
  return children;
};

export default PublicRoute;
