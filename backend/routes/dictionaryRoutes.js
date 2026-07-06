/**
 * dictionaryRoutes.js
 * Path: backend/routes/dictionaryRoutes.js
 * Description: Dictionary routes
 * Changes:
 * - ✅ FIXED: / route now uses getDictionary
 * - ✅ FIXED: All routes properly defined
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getDictionary,
  getWord,
  searchWords,
  getCategories,
  saveWord,
  removeWord,
  getSavedWords,
} from "../controllers/dictionaryController.js";

const router = express.Router();

// ============================================
// 📖 Dictionary Routes
// ============================================

// GET / - returns all words (✅ FIXED)
router.get("/", authenticate, getDictionary);

// GET /search - search words
router.get("/search", authenticate, searchWords);

// GET /categories - get categories
router.get("/categories", authenticate, getCategories);

// GET /word/:id - get word by id
router.get("/word/:id", authenticate, getWord);

// GET /saved-words - get saved words
router.get("/saved-words", authenticate, getSavedWords);

// POST /saved-words - save word
router.post("/saved-words", authenticate, saveWord);

// DELETE /saved-words/:id - remove saved word
router.delete("/saved-words/:id", authenticate, removeWord);

export default router;
