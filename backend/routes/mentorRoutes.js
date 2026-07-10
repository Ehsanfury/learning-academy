/**
 * mentorRoutes.js
 * Path: backend/routes/mentorRoutes.js
 * Description: Mentors routes
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
  updateMentor,
} from "../controllers/mentorController.js";

const router = express.Router();

router.use(authenticate);

router.post("/register", registerAsMentor);
router.get("/", getMentors);
router.get("/profile", getMyMentorProfile);
router.put("/profile", updateMentorProfile);
router.get("/stats", getMentorStats);
router.get("/my-sessions", getMySessions);
router.get("/:id", getMentorById);
router.put("/:id", updateMentor);
router.post("/:id/book", bookSession);
router.put("/sessions/:id/status", updateSessionStatus);
router.put("/sessions/:id/complete", completeSession);

export default router;
