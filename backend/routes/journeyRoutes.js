/**
 * journeyRoutes.js
 * Path: backend/routes/journeyRoutes.js
 * Description: Journey/Progress routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getJourney, getJourneyStats } from "../controllers/journeyController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getJourney);
router.get("/stats", getJourneyStats);

export default router;
