/**
 * spacedRepetitionController.js
 * Learning Academy
 * Spaced Repetition Controller
 * Changes:
 * - ✅ Using asyncHandler for consistency
 * - ✅ Added proper error handling
 * - ✅ Added validation
 */

import spacedRepetitionService from "../services/spacedRepetitionService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { ValidationError, NotFoundError } from "../errors/index.js";

export const reviewWord = asyncHandler(async (req, res) => {
  const { wordId } = req.params;
  const { quality } = req.body;
  const userId = req.user.id;

  if (!wordId) {
    throw new ValidationError({
      message: "Word ID is required",
      details: [{ field: "wordId", message: "Word ID is required" }],
    });
  }

  if (quality === undefined || quality === null || quality < 0 || quality > 5) {
    throw new ValidationError({
      message: "Quality must be between 0 and 5",
      details: [{ field: "quality", message: "Quality must be between 0 and 5" }],
    });
  }

  const result = await spacedRepetitionService.reviewWord(userId, wordId, quality);

  res.json({
    success: true,
    message: "Word reviewed successfully",
    data: result,
  });
});

export const getDueWords = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const words = await spacedRepetitionService.getDueWords(userId);

  res.json({
    success: true,
    data: words,
  });
});

export const getReviewStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await spacedRepetitionService.getReviewStats(userId);

  res.json({
    success: true,
    data: stats,
  });
});
