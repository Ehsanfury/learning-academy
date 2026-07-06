/**
 * mentorRoutes.js
 * German Academy
 Mentors routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  registerAsMentor,
  getMentors,
  getMentorById,
  getMyMentorProfile,
  bookSession,
  getMySessions,
  updateSessionStatus,
  completeSession,
  getMentorStats,
  updateMentorProfile,
} from "../controllers/mentorController.js";

const router = express.Router();

// TODO: Translate - TODO: Translate - همه مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

// Register as mentor
router.post("/register", registerAsMentor);

// Get mentors list
router.get("/", getMentors);

// Profile
router.get("/profile", getMyMentorProfile);

// Update mentor profile
router.put("/profile", updateMentorProfile);

// Get mentor statistics
router.get("/stats", getMentorStats);

// Get my sessions
router.get("/my-sessions", getMySessions);

// Get mentor details
router.get("/:id", getMentorById);

// Book session with mentor
router.post("/:id/book", bookSession);

// Approve or cancel session (for mentor)
router.put("/sessions/:id/status", updateSessionStatus);

// Complete session and submit feedback
router.put("/sessions/:id/complete", completeSession);

export default router;
