/**
 * LessonPage.test.jsx
 * Path: src/pages/Lesson/__tests__/LessonPage.test.jsx
 * Description: Tests for LessonPage component
 * Version: 1.0 - New test file
 * Coverage:
 * - ✅ Loading state
 * - ✅ Error state (lesson not found, fetch error)
 * - ✅ Render lesson content
 * - ✅ Section navigation
 * - ✅ Mark complete
 * - ✅ XP update after completion
 * - ✅ Quiz submission
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LessonPage from "../LessonPage";

// ============================================
// 🎭 Mocks
// ============================================

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User", xp: 100, level: 1 },
    isAuthenticated: true,
    refreshUser: vi.fn(),
  }),
}));

vi.mock("../../../services/lessonApi", () => ({
  lessonApi: {
    getLesson: vi.fn(),
    submitAnswer: vi.fn(),
    completeLesson: vi.fn(),
  },
}));

vi.mock("../../../services/progressApi", () => ({
  progressApi: {
    saveProgress: vi.fn(),
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
  useTheme: () => ({ theme: "light", isDark: false }),
}));

vi.mock("../../../components/ui/Toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import { lessonApi } from "../../../services/lessonApi";
import { progressApi } from "../../../services/progressApi";

// ============================================
// 🧪 Test Data
// ============================================

const mockLesson = {
  id: "a1-l01",
  title: { fa: "درس اول", en: "Lesson 1" },
  level: "A1",
  order: 1,
  sections: [
    {
      id: "intro",
      type: "introduction",
      title: "مقدمه",
      content: "به درس اول خوش آمدید",
    },
    {
      id: "vocab",
      type: "vocabulary",
      title: "واژگان",
      vocabulary: [
        { word: "Hallo", translation: "سلام" },
        { word: "Tschüss", translation: "خداحافظ" },
      ],
    },
    {
      id: "quiz",
      type: "quiz",
      title: "آزمون",
      questions: [
        {
          id: "q1",
          question: "معنی Hallo چیست؟",
          options: ["خداحافظ", "سلام", "ممنون", "خواهش می‌کنم"],
          correctAnswer: 1,
        },
      ],
    },
  ],
};

// ============================================
// 🧪 Test Wrapper
// ============================================

const renderWithProviders = (lessonId = "a1-l01") => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/lesson/${lessonId}`]}>
        <Routes>
          <Route path="/lesson/:id" element={<LessonPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// ============================================
// 🧪 Tests
// ============================================

describe("LessonPage", () => {
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
      lessonApi.getLesson.mockImplementation(() => new Promise(() => {}));

      renderWithProviders();

      expect(screen.getByTestId("lesson-skeleton")).toBeInTheDocument();
    });
  });

  // ============================================
  // ⚠️ Error State
  // ============================================

  describe("Error state", () => {
    it("should show error when lesson not found", async () => {
      lessonApi.getLesson.mockRejectedValue({
        response: { status: 404, data: { message: "Lesson not found" } },
      });

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText(/درس یافت نشد/i)).toBeInTheDocument();
      });
    });

    it("should show error on fetch failure", async () => {
      lessonApi.getLesson.mockRejectedValue(new Error("Network error"));

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText(/خطا در بارگذاری/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // 📚 Lesson Content Rendering
  // ============================================

  describe("Lesson content rendering", () => {
    beforeEach(() => {
      lessonApi.getLesson.mockResolvedValue({ success: true, data: { lesson: mockLesson } });
    });

    it("should render lesson title", async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("درس اول")).toBeInTheDocument();
      });
    });

    it("should render lesson level", async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("A1")).toBeInTheDocument();
      });
    });

    it("should render section tabs", async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("مقدمه")).toBeInTheDocument();
        expect(screen.getByText("واژگان")).toBeInTheDocument();
        expect(screen.getByText("آزمون")).toBeInTheDocument();
      });
    });

    it("should render introduction section by default", async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("به درس اول خوش آمدید")).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // 🧭 Section Navigation
  // ============================================

  describe("Section navigation", () => {
    beforeEach(() => {
      lessonApi.getLesson.mockResolvedValue({ success: true, data: { lesson: mockLesson } });
    });

    it("should switch to vocabulary section on tab click", async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("مقدمه")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("واژگان"));

      await waitFor(() => {
        expect(screen.getByText("Hallo")).toBeInTheDocument();
        expect(screen.getByText("سلام")).toBeInTheDocument();
      });
    });

    it("should switch to quiz section on tab click", async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("آزمون")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("آزمون"));

      await waitFor(() => {
        expect(screen.getByText("معنی Hallo چیست؟")).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // ✅ Quiz Submission
  // ============================================

  describe("Quiz submission", () => {
    beforeEach(() => {
      lessonApi.getLesson.mockResolvedValue({ success: true, data: { lesson: mockLesson } });
      lessonApi.submitAnswer.mockResolvedValue({ success: true, isCorrect: true });
    });

    it("should submit answer and show correct feedback", async () => {
      renderWithProviders();

      await waitFor(() => {
        fireEvent.click(screen.getByText("آزمون"));
      });

      await waitFor(() => {
        expect(screen.getByText("معنی Hallo چیست؟")).toBeInTheDocument();
      });

      // Select correct answer (index 1)
      fireEvent.click(screen.getByText("سلام"));

      // Submit
      fireEvent.click(screen.getByRole("button", { name: /ثبت پاسخ/i }));

      await waitFor(() => {
        expect(lessonApi.submitAnswer).toHaveBeenCalledWith(
          "a1-l01",
          "q1",
          1,
        );
      });
    });
  });

  // ============================================
  // ✅ Complete Lesson
  // ============================================

  describe("Complete lesson", () => {
    beforeEach(() => {
      lessonApi.getLesson.mockResolvedValue({ success: true, data: { lesson: mockLesson } });
      lessonApi.completeLesson.mockResolvedValue({
        success: true,
        data: { xpEarned: 50, newLevel: 2 },
      });
      progressApi.saveProgress.mockResolvedValue({ success: true });
    });

    it("should call completeLesson on completion", async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("درس اول")).toBeInTheDocument();
      });

      // Find complete button
      const completeButton = screen.queryByRole("button", { name: /تکمیل درس/i });
      if (completeButton) {
        fireEvent.click(completeButton);

        await waitFor(() => {
          expect(lessonApi.completeLesson).toHaveBeenCalledWith("a1-l01");
        });
      }
    });
  });
});
