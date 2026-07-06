/**
 * mentorController.js
 * Path: backend/controllers/mentorController.js
 * Description: Mentor management controller
 * Changes:
 * - ✅ Using mentorService for all operations
 * - ✅ Mock data fallback
 * - ✅ Proper error handling
 */

import mentorService from "../services/mentorService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { ValidationError, NotFoundError, UnauthorizedError } from "../errors/index.js";
import logger from "../config/logger.js";

/**
 * Register as mentor
 * POST /api/mentors/register
 */
export const registerAsMentor = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  const mentor = await mentorService.registerAsMentor(userId, data);

  res.status(201).json({
    success: true,
    message: "You are now registered as a mentor",
    data: mentor,
  });
});

/**
 * Get mentors list
 * GET /api/mentors
 */
export const getMentors = asyncHandler(async (req, res) => {
  const { level, language, limit = 20, offset = 0 } = req.query;

  logger.info(`📚 Getting mentors`);

  const result = await mentorService.getMentors({ level, language, limit, offset });

  res.json({
    success: true,
    data: result.mentors,
    total: result.total,
    isMock: result.isMock || false,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: result.total,
    },
  });
});

/**
 * Get mentor details
 * GET /api/mentors/:id
 */
export const getMentorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mentor = await mentorService.getMentorById(id);

  if (!mentor) {
    throw new NotFoundError({
      message: "Mentor not found",
      resource: { model: "Mentor", id },
    });
  }

  res.json({
    success: true,
    data: mentor,
  });
});

/**
 * Get current user mentor profile
 * GET /api/mentors/profile
 */
export const getMyMentorProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const mentor = await mentorService.getMentorByUserId(userId);

  if (!mentor) {
    throw new NotFoundError({
      message: "You are not registered as a mentor",
      resource: { model: "Mentor", userId },
    });
  }

  res.json({
    success: true,
    data: mentor,
  });
});

/**
 * Book session with mentor
 * POST /api/mentors/:id/book
 */
export const bookSession = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { id: mentorId } = req.params;
  const { startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    throw new ValidationError({
      message: "Start time and end time are required",
      details: [
        { field: "startTime", message: "Start time is required" },
        { field: "endTime", message: "End time is required" },
      ],
    });
  }

  const session = await mentorService.bookSession(studentId, mentorId, startTime, endTime);

  res.status(201).json({
    success: true,
    message: "Session booked successfully",
    data: session,
  });
});

/**
 * Get my sessions
 * GET /api/mentors/my-sessions
 */
export const getMySessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { role = "student" } = req.query;

  const sessions = await mentorService.getUserSessions(userId, role);

  res.json({
    success: true,
    data: sessions,
  });
});

/**
 * Approve or cancel session (for mentor)
 * PUT /api/mentors/sessions/:id/status
 */
export const updateSessionStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: sessionId } = req.params;
  const { status } = req.body;

  if (!status || !["confirmed", "cancelled"].includes(status)) {
    throw new ValidationError({
      message: "Status must be 'confirmed' or 'cancelled'",
      details: [{ field: "status", message: "Invalid status value" }],
    });
  }

  const mentor = await mentorService.getMentorByUserId(userId);
  if (!mentor) {
    throw new NotFoundError({
      message: "You are not registered as a mentor",
      resource: { model: "Mentor", userId },
    });
  }

  const session = await mentorService.updateSessionStatus(sessionId, status, mentor.id);

  res.json({
    success: true,
    message: `Session ${status}`,
    data: session,
  });
});

/**
 * Complete session and submit feedback
 * PUT /api/mentors/sessions/:id/complete
 */
export const completeSession = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { id: sessionId } = req.params;
  const { review, rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ValidationError({
      message: "Rating must be between 1 and 5",
      details: [{ field: "rating", message: "Invalid rating value" }],
    });
  }

  const session = await mentorService.completeSession(sessionId, studentId, review, rating);

  res.json({
    success: true,
    message: "Session completed and reviewed",
    data: session,
  });
});

/**
 * Get mentor statistics
 * GET /api/mentors/stats
 */
export const getMentorStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const mentor = await mentorService.getMentorByUserId(userId);
  if (!mentor) {
    throw new NotFoundError({
      message: "You are not registered as a mentor",
      resource: { model: "Mentor", userId },
    });
  }

  const stats = await mentorService.getMentorStats(mentor.id);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Update mentor profile
 * PUT /api/mentors/profile
 */
export const updateMentorProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  const mentor = await mentorService.updateMentorProfile(userId, data);

  res.json({
    success: true,
    message: "Mentor profile updated",
    data: mentor,
  });
});
