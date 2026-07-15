/**
 * aiRoutes.js
 * Path: backend/routes/aiRoutes.js
 * Description: AI routes
 * Changes:
 * - ✅ FIXED: Added GET /conversations/:sessionId route
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { aiLimiter } from "../middlewares/rateLimiter.js";
import {
  chat,
  correctGrammar,
  translateToGerman,
  explainGrammar,
  generateExercise,
  startScenario,
  continueScenario,
  getConversationHistory,
  getConversations,
  getConversationById,
  getSessions,
  deleteHistory,
} from "../controllers/aiController.js";

const router = express.Router();

// All routes require auth + AI rate limit (20 req/min per user) to protect AI bills
router.use(authenticate);
router.use(aiLimiter);

// چت عمومی
router.post("/chat", chat);

// Grammar correction
router.post("/grammar/correct", correctGrammar);

// Translate to German
router.post("/translate", translateToGerman);

// Grammar explanation
router.post("/grammar/explain", explainGrammar);

// Generate exercise
router.post("/exercise/generate", generateExercise);

// سناریوها
router.post("/scenario/start", startScenario);
router.post("/scenario/continue", continueScenario);

// ✅ تاریخچه مکالمات
router.get("/history", getConversationHistory);
router.get("/conversations", getConversations);
router.get("/conversations/:sessionId", getConversationById);
router.get("/sessions", getSessions);

// حذف تاریخچه
router.delete("/history/:sessionId", deleteHistory);

export default router;
