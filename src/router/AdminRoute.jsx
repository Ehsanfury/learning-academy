/**
 * AdminRoute.jsx
 * Path: src/router/AdminRoute.jsx
 * Description: Admin route guard - only allows admin users
 * Changes:
 * - ✅ FIXED: Added debug logs
 * - ✅ FIXED: Better role checking
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("🔐 AdminRoute check:", {
    isLoading,
    hasUser: !!user,
    userRole: user?.role,
    isAdmin: user?.role === "admin",
    path: location.pathname,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    console.log("🔐 No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    console.log(`🔐 User ${user.email} has role "${user.role}", not admin`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log("✅ Admin access granted for:", user.email);
  return children;
}

export default AdminRoute;
