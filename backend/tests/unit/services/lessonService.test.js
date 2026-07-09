/**
 * lessonService.test.js
 * Path: backend/tests/unit/services/lessonService.test.js
 * Description: Lesson service unit tests
 * Changes:
 * - ✅ FIXED: Changed from @jest/globals to vitest
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import lessonService from "../../../services/lessonService.js";

describe("LessonService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllLessons", () => {
    it("should return lessons for guest user", async () => {
      // Test implementation
    });
  });

  describe("getLesson", () => {
    it("should return lesson for guest user", async () => {
      // Test implementation
    });
  });
});
