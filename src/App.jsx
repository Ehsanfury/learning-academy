/**
 * App.jsx
 * Path: src/App.jsx
 * Description: Main application component with routing
 * Changes:
 * - ✅ FIXED: Home page is now public (no redirect to login)
 * - ✅ FIXED: Added About and Support pages
 */

import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LessonLayout from "./layouts/LessonLayout";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

// Route Guards
import PrivateRoute from "./router/PrivateRoute";
import PublicRoute from "./router/PublicRoute";

// UI Components
import LoadingSpinner from "./components/LoadingSpinner";

// Pages (lazy loaded)
const Home = lazy(() => import("./pages/Home/HomePage"));
const Login = lazy(() => import("./pages/Login/LoginPage"));
const Register = lazy(() => import("./pages/Register/RegisterPage"));
const Dashboard = lazy(() => import("./pages/Dashboard/DashboardPage"));
const Learn = lazy(() => import("./pages/Learn/LearnPage"));
const Lesson = lazy(() => import("./pages/Lesson/LessonPage"));
const Practice = lazy(() => import("./pages/Practice/PracticePage"));
const PracticeDetail = lazy(
  () => import("./pages/Practice/PracticeDetailPage"),
);
const Stories = lazy(() => import("./pages/Stories/StoriesPage"));
const Scenarios = lazy(() => import("./pages/Scenarios/ScenariosPage"));
const Dictionary = lazy(() => import("./pages/Dictionary/DictionaryPage"));
const AiTutor = lazy(() => import("./pages/AiTutor/AiTutorPage"));
const Mentors = lazy(() => import("./pages/Mentors/MentorsPage"));
const Journey = lazy(() => import("./pages/Journey/JourneyPage"));
const Profile = lazy(() => import("./pages/Profile/ProfilePage"));
const Settings = lazy(() => import("./pages/Settings/SettingsPage"));
const Achievements = lazy(
  () => import("./pages/Achievements/AchievementsPage"),
);
const Leaderboard = lazy(() => import("./pages/Leaderboard/LeaderboardPage"));
const Review = lazy(() => import("./pages/Review/ReviewPage"));
const Exercise = lazy(() => import("./pages/Exercise/ExercisePage"));
const Admin = lazy(() => import("./pages/Admin/AdminDashboard"));
const NotFoundPage = lazy(() => import("./pages/NotFound/NotFoundPage"));
const VocabularyPage = lazy(() => import("./pages/Vocabulary/VocabularyPage"));
const NotificationsPage = lazy(
  () => import("./pages/Notifications/NotificationsPage"),
);

// ✅ NEW: About and Support pages
const AboutPage = lazy(() => import("./pages/About/AboutPage"));
const SupportPage = lazy(() => import("./pages/Support/SupportPage"));

// Components
import ErrorBoundary from "./components/ErrorBoundary";

// Hooks
import { useResponsive } from "./hooks/useResponsive";
import { useAuth } from "./context/AuthContext";

// Styles
import "./styles/globals.css";

// ============================================
// 🖼️ Loading Fallback
// ============================================

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// ============================================
// 🔐 Admin Route Guard
// ============================================

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ============================================
// 📱 App Component
// ============================================

function App() {
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);

    return () => window.removeEventListener("resize", setVH);
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <AnimatePresence mode="wait">
                  <Routes>
                    {/* ========== PUBLIC ROUTES (No Auth Required) ========== */}

                    {/* ✅ Home Page - Public (No redirect to login) */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/support" element={<SupportPage />} />
                    </Route>

                    {/* ========== AUTH ROUTES ========== */}

                    <Route element={<AuthLayout />}>
                      <Route
                        path="/login"
                        element={
                          <PublicRoute>
                            <Login />
                          </PublicRoute>
                        }
                      />
                      <Route
                        path="/register"
                        element={
                          <PublicRoute>
                            <Register />
                          </PublicRoute>
                        }
                      />
                    </Route>

                    {/* ========== PROTECTED ROUTES (Auth Required) ========== */}

                    <Route
                      element={
                        <PrivateRoute>
                          <DashboardLayout />
                        </PrivateRoute>
                      }
                    >
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/learn" element={<Learn />} />
                      <Route path="/practice" element={<Practice />} />
                      <Route
                        path="/practice/:type"
                        element={<PracticeDetail />}
                      />
                      <Route path="/stories" element={<Stories />} />
                      <Route path="/scenarios" element={<Scenarios />} />
                      <Route path="/dictionary" element={<Dictionary />} />
                      <Route path="/ai-tutor" element={<AiTutor />} />
                      <Route path="/mentors" element={<Mentors />} />
                      <Route path="/journey" element={<Journey />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/achievements" element={<Achievements />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/review" element={<Review />} />
                      <Route path="/vocabulary" element={<VocabularyPage />} />
                      <Route
                        path="/notifications"
                        element={<NotificationsPage />}
                      />
                    </Route>

                    {/* Lesson Layout */}
                    <Route
                      element={
                        <PrivateRoute>
                          <LessonLayout />
                        </PrivateRoute>
                      }
                    >
                      <Route path="/lesson/:id" element={<Lesson />} />
                    </Route>

                    {/* Exercise Routes */}
                    <Route
                      element={
                        <PrivateRoute>
                          <DashboardLayout />
                        </PrivateRoute>
                      }
                    >
                      <Route path="/exercise" element={<Exercise />} />
                      <Route path="/exercise/:type" element={<Exercise />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                      element={
                        <AdminRoute>
                          <DashboardLayout />
                        </AdminRoute>
                      }
                    >
                      <Route path="/admin/*" element={<Admin />} />
                    </Route>

                    {/* ========== 404 ========== */}
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </AnimatePresence>
              </Suspense>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#1f2937",
                    color: "#fff",
                    borderRadius: "12px",
                  },
                  success: {
                    iconTheme: { primary: "#22c55e", secondary: "#fff" },
                  },
                  error: {
                    iconTheme: { primary: "#ef4444", secondary: "#fff" },
                  },
                }}
              />
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
