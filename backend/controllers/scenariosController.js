/**
 * scenariosController.js
 * Path: backend/controllers/scenariosController.js
 * Description: Scenario controller using scenarioService
 */

import scenarioService from "../services/scenarioService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { NotFoundError, ValidationError } from "../errors/index.js";
import logger from "../config/logger.js";

/**
 * Get all scenarios
 * GET /api/scenarios
 */
export const getScenarios = asyncHandler(async (req, res) => {
  const { level, limit = 20, offset = 0 } = req.query;

  logger.info(`📚 Getting scenarios`);

  const result = await scenarioService.getScenarios({ level, limit, offset });

  res.json({
    success: true,
    data: result.scenarios,
    total: result.total,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: result.total,
    },
  });
});

/**
 * Get scenario by ID
 * GET /api/scenarios/:id
 */
export const getScenarioById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const scenario = await scenarioService.getScenarioById(id);

  if (!scenario) {
    throw new NotFoundError({
      message: "Scenario not found",
      resource: { model: "Scenario", id },
    });
  }

  res.json({
    success: true,
    data: scenario,
  });
});

/**
 * Create a new scenario (admin)
 * POST /api/scenarios
 */
export const createScenario = asyncHandler(async (req, res) => {
  const data = req.body;

  logger.info(`📝 Creating new scenario: ${data.title?.en || data.id}`);

  if (!data.id) {
    throw new ValidationError({
      message: "Scenario ID is required",
      details: [{ field: "id", message: "Scenario ID is required" }],
    });
  }

  const scenario = await scenarioService.createScenario(data);

  res.status(201).json({
    success: true,
    message: "Scenario created successfully",
    data: scenario,
  });
});

/**
 * Update scenario (admin)
 * PUT /api/scenarios/:id
 */
export const updateScenario = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const scenario = await scenarioService.updateScenario(id, data);

  if (!scenario) {
    throw new NotFoundError({
      message: "Scenario not found",
      resource: { model: "Scenario", id },
    });
  }

  res.json({
    success: true,
    message: "Scenario updated successfully",
    data: scenario,
  });
});

/**
 * Delete scenario (admin)
 * DELETE /api/scenarios/:id
 */
export const deleteScenario = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await scenarioService.deleteScenario(id);

  if (!result) {
    throw new NotFoundError({
      message: "Scenario not found",
      resource: { model: "Scenario", id },
    });
  }

  res.json({
    success: true,
    message: "Scenario deleted successfully",
  });
});

/**
 * Start a scenario
 * POST /api/scenarios/:id/start
 */
export const startScenario = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  logger.info(`🎯 Starting scenario: ${id} for user: ${userId}`);

  const result = await scenarioService.startScenario(userId, id);

  res.json({
    success: true,
    data: {
      session: result.session,
      scenario: result.scenario,
      currentStep: 0,
      totalSteps: result.scenario.steps?.length || 0,
      isExisting: result.isExisting,
    },
  });
});

/**
 * Submit step answer
 * POST /api/scenarios/:id/step
 */
export const submitStep = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { stepIndex, answer } = req.body;

  if (stepIndex === undefined || answer === undefined) {
    throw new ValidationError({
      message: "stepIndex and answer are required",
      details: [
        { field: "stepIndex", message: "stepIndex is required" },
        { field: "answer", message: "answer is required" },
      ],
    });
  }

  const result = await scenarioService.submitStep(userId, id, stepIndex, answer);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Get scenario progress
 * GET /api/scenarios/:id/progress
 */
export const getScenarioProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const progress = await scenarioService.getProgress(userId, id);

  res.json({
    success: true,
    data: progress,
  });
});

/**
 * Get scenario stats
 * GET /api/scenarios/stats
 */
export const getScenarioStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await scenarioService.getStats(userId);

  res.json({
    success: true,
    data: stats,
  });
});

export default {
  getScenarios,
  getScenarioById,
  createScenario,
  updateScenario,
  deleteScenario,
  startScenario,
  submitStep,
  getScenarioProgress,
  getScenarioStats,
};