/**
 * aiRoutes.js
 * German Academy
 AI routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  chat,
  correctGrammar,
  translateToGerman,
  explainGrammar,
  generateExercise,
  startScenario,
  continueScenario,
  getConversationHistory,
  getSessions,
} from "../controllers/aiController.js";

const router = express.Router();

// TODO: Translate - TODO: Translate - همه مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

// TODO: Translate - TODO: Translate - چت عمومی
router.post("/chat", chat);

// Grammar correction
router.post("/grammar/correct", correctGrammar);

// Translate to German
router.post("/translate", translateToGerman);

// Grammar explanation
router.post("/grammar/explain", explainGrammar);

// Generate exercise
router.post("/exercise/generate", generateExercise);

// TODO: Translate - TODO: Translate - سناریوهای نقش‌آفرینی
router.post("/scenario/start", startScenario);
router.post("/scenario/continue", continueScenario);

// Get conversation history
router.get("/history", getConversationHistory);
router.get("/sessions", getSessions);

export default router;
