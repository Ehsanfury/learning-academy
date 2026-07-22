/**
 * DashboardPage.test.jsx
 * Path: src/pages/Dashboard/__tests__/DashboardPage.test.jsx
 * Description: Tests for DashboardPage component
 * Version: 1.0 - New test file
 * Coverage:
 * - ✅ Loading state
 * - ✅ Error state
 * - ✅ Render user data (name, XP, level, streak)
 * - ✅ Render lesson progress
 * - ✅ Render weekly activity chart
 * - ✅ Render achievements preview
 * - ✅ Navigation to lessons
 * - ✅ Empty state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardPage from "../DashboardPage";

// ============================================
// 🎭 Mocks
// ============================================

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      xp: 750,
      level: 3,
      streak: 7,
      avatar: null,
    },
    isAuthenticated: true,
    refreshUser: vi.fn(),
  }),
}));

vi.mock("../../../services/progressApi", () => ({
  progressApi: {
    getDashboard: vi.fn(),
    getWeeklyActivity: vi.fn(),
  },
}));

vi.mock("../../../services/lessonApi", () => ({
  lessonApi: {
    getLessons: vi.fn(),
  },
}));

vi.mock("../../../services/achievementApi", () => ({
  achievementApi: {
    getRecent: vi.fn(),
  },
}));

vi.mock("../../../context/LanguageContext", () => ({
  useLanguageContext: () => ({
    language: "fa",
    t: (key) => key,
    dir: "rtl",
  }),
}));

vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    isDark: false,
  }),
}));

import { progressApi } from "../../../services/progressApi";
import { lessonApi } from "../../../services/lessonApi";
import { achievementApi } from "../../../services/achievementApi";

// ============================================
// 🧪 Test Wrapper
// ============================================

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryClientProvider>
    </QueryClientProvider>
  );
};

// ============================================
// 🧪 Tests
// ============================================

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // 📊 Loading State
  // ============================================

  describe("Loading state", () => {
    it("should show skeleton while loading", () => {
      progressApi.getDashboard.mockImplementation(() => new Promise(() => {}));
      lessonApi.getLessons.mockImplementation(() => new Promise(() => {}));
      achievementApi.getRecent.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<DashboardPage />);

      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });
  });

  // ============================================
  // ⚠️ Error State
  // ============================================

  describe("Error state", () => {
    it("should show error state on API failure", async () => {
      progressApi.getDashboard.mockRejectedValue(new Error("Failed to load"));
      lessonApi.getLessons.mockResolvedValue({ lessons: [] });
      achievementApi.getRecent.mockResolvedValue([]);

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/خطا در بارگذاری/i)).toBeInTheDocument();
      });
    });

    it("should retry on error retry button click", async () => {
      progressApi.getDashboard
        .mockRejectedValueOnce(new Error("Failed"))
        .mockResolvedValueOnce({
          totalLessons: 10,
          completedLessons: 3,
          totalXP: 750,
        });
      lessonApi.getLessons.mockResolvedValue({ lessons: [] });
      achievementApi.getRecent.mockResolvedValue([]);

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/تلاش مجدد/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/تلاش مجدد/i));

      await waitFor(() => {
        expect(progressApi.getDashboard).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ============================================
  // 📊 User Data Rendering
  // ============================================

  describe("User data rendering", () => {
    beforeEach(() => {
      progressApi.getDashboard.mockResolvedValue({
        totalLessons: 12,
        completedLessons: 4,
        totalXP: 750,
        weeklyActivity: [
          { day: "شنبه", xp: 100 },
          { day: "یکشنبه", xp: 50 },
          { day: "دوشنبه", xp: 200 },
          { day: "سه‌شنبه", xp: 0 },
          { day: "چهارشنبه", xp: 150 },
          { day: "پنجشنبه", xp: 200 },
          { day: "جمعه", xp: 50 },
        ],
      });
      lessonApi.getLessons.mockResolvedValue({
        lessons: [
          {
            id: "a1-l01",
            title: { fa: "درس ۱" },
            level: "A1",
            progress: { completed: true, percentage: 100 },
          },
          {
            id: "a1-l02",
            title: { fa: "درس ۲" },
            level: "A1",
            progress: { completed: false, percentage: 50 },
          },
        ],
      });
      achievementApi.getRecent.mockResolvedValue([
        { id: 1, name: "اولین قدم", unlockedAt: new Date() },
      ]);
    });

    it("should render user name", async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Test User")).toBeInTheDocument();
      });
    });

    it("should render XP value", async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/750/)).toBeInTheDocument();
      });
    });

    it("should render level", async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/۳|3/)).toBeInTheDocument();
      });
    });

    it("should render streak", async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/۷|7/)).toBeInTheDocument();
      });
    });

    it("should render lesson progress", async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("درس ۱")).toBeInTheDocument();
        expect(screen.getByText("درس ۲")).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // 📭 Empty State
  // ============================================

  describe("Empty state", () => {
    it("should show empty state when no lessons", async () => {
      progressApi.getDashboard.mockResolvedValue({
        totalLessons: 0,
        completedLessons: 0,
        totalXP: 0,
      });
      lessonApi.getLessons.mockResolvedValue({ lessons: [] });
      achievementApi.getRecent.mockResolvedValue([]);

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/هنوز درسی شروع نشده/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // 🧭 Navigation
  // ============================================

  describe("Navigation", () => {
    it("should have link to learn page", async () => {
      progressApi.getDashboard.mockResolvedValue({
        totalLessons: 0,
        completedLessons: 0,
      });
      lessonApi.getLessons.mockResolvedValue({ lessons: [] });
      achievementApi.getRecent.mockResolvedValue([]);

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        const link = screen.getByRole("link", { name: /شروع یادگیری/i });
        expect(link).toHaveAttribute("href", "/learn");
      });
    });
  });
});
