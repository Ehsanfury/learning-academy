/**
 * lessonService.test.js
 * Path: backend/tests/unit/services/lessonService.test.js
 * Description: Lesson service unit tests
 */

import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import lessonService from "../../../services/lessonService.js";
import lessonRepository from "../../../repositories/lessonRepository.js";
import progressRepository from "../../../repositories/progressRepository.js";
import userRepository from "../../../repositories/userRepository.js";

jest.mock("../../../repositories/lessonRepository.js");
jest.mock("../../../repositories/progressRepository.js");
jest.mock("../../../repositories/userRepository.js");

describe("LessonService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllLessons", () => {
    const mockLessons = [
      {
        id: "L1",
        title: "Lesson 1",
        level: "A1",
        toJSON: () => ({ id: "L1", title: "Lesson 1", level: "A1" }),
      },
      {
        id: "L2",
        title: "Lesson 2",
        level: "A1",
        toJSON: () => ({ id: "L2", title: "Lesson 2", level: "A1" }),
      },
    ];

    it("should return all lessons for guest user", async () => {
      lessonRepository.findAll.mockResolvedValue(mockLessons);
      progressRepository.findByUserAndLessons.mockResolvedValue([]);

      const result = await lessonService.getAllLessons(null);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("progress");
      expect(lessonRepository.findAll).toHaveBeenCalled();
    });

    it("should return lessons with user progress", async () => {
      const userId = "user123";
      const mockProgress = [
        {
          lessonId: "L1",
          status: "completed",
          score: 100,
          toJSON: () => ({ lessonId: "L1", status: "completed", score: 100 }),
        },
      ];

      lessonRepository.findAll.mockResolvedValue(mockLessons);
      progressRepository.findByUserAndLessons.mockResolvedValue(mockProgress);

      const result = await lessonService.getAllLessons(userId);

      expect(result).toHaveLength(2);
      expect(result[0].progress.status).toBe("completed");
      expect(result[0].isCompleted).toBe(true);
      expect(progressRepository.findByUserAndLessons).toHaveBeenCalledWith(userId, ["L1", "L2"]);
    });

    it("should return empty array if no lessons found", async () => {
      lessonRepository.findAll.mockResolvedValue([]);

      const result = await lessonService.getAllLessons(null);

      expect(result).toEqual([]);
    });
  });

  describe("getLesson", () => {
    const mockLesson = {
      id: "L1",
      title: "Lesson 1",
      level: "A1",
      prerequisites: [],
      toJSON: () => ({ id: "L1", title: "Lesson 1", level: "A1", prerequisites: [] }),
    };

    it("should return lesson for guest user", async () => {
      lessonRepository.findByIdOrFail.mockResolvedValue(mockLesson);

      const result = await lessonService.getLesson(null, "L1");

      expect(result).toHaveProperty("id", "L1");
      expect(result).toHaveProperty("isLocked", false);
      expect(result).toHaveProperty("canAccess", true);
    });

    it("should return lesson with progress for authenticated user", async () => {
      const userId = "user123";
      const mockProgress = {
        status: "in_progress",
        score: 50,
        toJSON: () => ({ status: "in_progress", score: 50 }),
      };

      lessonRepository.findByIdOrFail.mockResolvedValue(mockLesson);
      progressRepository.findByUserAndLesson.mockResolvedValue(mockProgress);

      const result = await lessonService.getLesson(userId, "L1");

      expect(result).toHaveProperty("userProgress");
      expect(result.userProgress.status).toBe("in_progress");
    });

    it("should throw error if lesson not found", async () => {
      lessonRepository.findByIdOrFail.mockRejectedValue(new Error("LESSON_NOT_FOUND"));

      await expect(lessonService.getLesson(null, "invalid")).rejects.toThrow("LESSON_NOT_FOUND");
    });
  });
});
