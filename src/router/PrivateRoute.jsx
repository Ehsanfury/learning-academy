/**
 * PrivateRoute.jsx
 * Path: src/router/PrivateRoute.jsx
 * Description: Private route guard - redirects to login if not authenticated
 * Changes:
 * - FIXED C6: Now actively used in App.jsx
 * - Added location state for redirect after login
 * - Better loading state handling
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 *
 * Usage:
 * <Route element={<PrivateRoute><Dashboard /></PrivateRoute>} />
 */
const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    // Save the current location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return children;
};

export default PrivateRoute;
