/**
 * App.jsx
 * Path: src/App.jsx
 * Description: Main application component with routing
 * Version: 3.1 - Removed monitoring import to fix build
 * Changes:
 * - ✅ REMOVED: monitoring import (causing build failure)
 * - ✅ Added ToastProvider
 * - ✅ Better Error Boundary
 * - ✅ Lazy loading for all pages
 * - ✅ Skip link for accessibility
 */

import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// UI Components
import { ToastProvider } from "./components/ui/Toast";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";

// A11y
import { SkipLink } from "./components/a11y/ScreenReader";

// Route Guards
import PrivateRoute from "./router/PrivateRoute";
import PublicRoute from "./router/PublicRoute";
import AdminRoute from "./router/AdminRoute";

// Hooks
import { useResponsive } from "./hooks/useResponsive";

// Styles
import "./styles/globals.css";

// ============================================
// 🖼️ Lazy-loaded Pages
// ============================================

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
const NotFoundPage = lazy(() => import("./pages/NotFound/NotFoundPage"));
const VocabularyPage = lazy(() => import("./pages/Vocabulary/VocabularyPage"));
const NotificationsPage = lazy(
  () => import("./pages/Notifications/NotificationsPage"),
);

// Admin Pages
const AdminPage = lazy(() => import("./pages/Admin/AdminPage"));

// Public Pages
const AboutPage = lazy(() => import("./pages/About/AboutPage"));
const ContactPage = lazy(() => import("./pages/Contact/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQ/FAQPage"));
const PrivacyPage = lazy(() => import("./pages/Privacy/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/Terms/TermsPage"));
const BlogPage = lazy(() => import("./pages/Blog/BlogPage"));
const SupportPage = lazy(() => import("./pages/Support/SupportPage"));
const DisclaimerPage = lazy(() => import("./pages/Disclaimer/DisclaimerPage"));
const CookiesPage = lazy(() => import("./pages/Cookies/CookiesPage"));

// ============================================
// 🖼️ Loading Fallback
// ============================================

const LoadingFallback = () => (
  <div
    className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950"
    role="status"
    aria-live="polite"
  >
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-neutral-500">در حال بارگذاری...</p>
    </div>
  </div>
);

// ============================================
// 📱 App Component
// ============================================

function App() {
  const { isMobile, isTablet } = useResponsive();

  // ============================================
  // 📱 Viewport Height Fix (Mobile)
  // ============================================

  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider position="top-left">
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              {/* Skip Link for Accessibility */}
              <SkipLink targetId="main-content" />

              {/* Error Boundary */}
              <ErrorBoundary>
                {/* Suspense for Lazy Loading */}
                <Suspense fallback={<LoadingFallback />}>
                  <AnimatePresence mode="wait">
                    <Routes>
                      {/* ========================================================= */}
                      {/* ✅ PUBLIC ROUTES - No Auth Required */}
                      {/* ========================================================= */}

                      <Route path="/" element={<MainLayout />}>
                        <Route index element={<Home />} />
                      </Route>

                      <Route element={<MainLayout />}>
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/support" element={<SupportPage />} />
                        <Route
                          path="/disclaimer"
                          element={<DisclaimerPage />}
                        />
                        <Route path="/cookies" element={<CookiesPage />} />
                      </Route>

                      {/* ========================================================= */}
                      {/* ✅ AUTH ROUTES - Login/Register */}
                      {/* ========================================================= */}

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

                      {/* ========================================================= */}
                      {/* 🔒 PROTECTED ROUTES - Auth Required */}
                      {/* ========================================================= */}

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
                        <Route
                          path="/achievements"
                          element={<Achievements />}
                        />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/review" element={<Review />} />
                        <Route
                          path="/vocabulary"
                          element={<VocabularyPage />}
                        />
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

                      {/* ========================================================= */}
                      {/* 🛡️ ADMIN ROUTES - Admin Only */}
                      {/* ========================================================= */}
                      <Route
                        path="/admin/*"
                        element={
                          <AdminRoute>
                            <AdminPage />
                          </AdminRoute>
                        }
                      />

                      {/* ========================================================= */}
                      {/* ❌ 404 Not Found */}
                      {/* ========================================================= */}

                      <Route path="/404" element={<NotFoundPage />} />
                      <Route
                        path="*"
                        element={<Navigate to="/404" replace />}
                      />
                    </Routes>
                  </AnimatePresence>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
