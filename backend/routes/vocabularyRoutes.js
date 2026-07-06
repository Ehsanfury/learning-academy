/**
 * vocabularyRoutes.js
 * Path: backend/routes/vocabularyRoutes.js
 * Description: Vocabulary routes for flashcards and word management
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getWords,
  getWordById,
  saveWord,
  removeWord,
  getSavedWords,
  reviewWord,
  getCategories,
} from "../controllers/vocabularyController.js";

const router = express.Router();

// TODO: Translate - TODO: Translate - همه مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

// Get words list
router.get("/words", getWords);

// Get word by ID
router.get("/words/:id", getWordById);

// Get dictionary categories
router.get("/categories", getCategories);

// TODO: Translate - TODO: Translate - مدیریت لغات ذخیره شده کاربر
router.get("/saved", getSavedWords);
router.post("/saved/:wordId", saveWord);
router.delete("/saved/:wordId", removeWord);

// Review word
router.post("/review/:wordId", reviewWord);

export default router;
