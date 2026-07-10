/**
 * scenariosRoutes.js
 * Path: backend/routes/scenariosRoutes.js
 * Description: Scenario routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getScenarios,
  getScenarioById,
  createScenario,
  updateScenario,
  deleteScenario,
  startScenario,
  submitStep,
  getScenarioProgress,
  getScenarioStats,
} from "../controllers/scenariosController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getScenarios);
router.get("/stats", getScenarioStats);
router.get("/:id", getScenarioById);
router.post("/", createScenario);
router.put("/:id", updateScenario);
router.delete("/:id", deleteScenario);
router.post("/:id/start", startScenario);
router.post("/:id/step", submitStep);
router.get("/:id/progress", getScenarioProgress);

export default router;
