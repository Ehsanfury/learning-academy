/**
 * dictionaryRoutes.js
 * Path: backend/routes/dictionaryRoutes.js
 * Description: Dictionary routes
 * Changes:
 * - ✅ FIXED: Order of routes (specific before generic)
 * - ✅ FIXED: /saved before /:id
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

router.use(authenticate);

router.get("/", getDictionary);
router.get("/search", searchWords);
router.get("/categories", getCategories);
router.get("/saved", getSavedWords);
router.post("/saved", saveWord);
router.delete("/saved/:id", removeWord);
router.get("/:id", getWord);

export default router;
