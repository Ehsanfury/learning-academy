/**
 * scenarioService.js
 * Path: backend/services/scenarioService.js
 * Description: Scenario service
 */

import { Scenario, ScenarioSession } from "../models/index.js";
import logger from "../config/logger.js";
import userService from "./userService.js";

class ScenarioService {
  async getScenarios(filters = {}) {
    try {
      const { level, limit = 20, offset = 0 } = filters;
      const where = { isActive: true };
      if (level) where.level = level.toUpperCase();

      const { count, rows } = await Scenario.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ["level", "ASC"],
          ["createdAt", "DESC"],
        ],
      });

      return { scenarios: rows, total: count };
    } catch (error) {
      logger.error(`Error in getScenarios:`, error);
      return { scenarios: [], total: 0 };
    }
  }

  async getScenarioById(scenarioId) {
    try {
      return await Scenario.findByPk(scenarioId);
    } catch (error) {
      logger.error(`Error in getScenarioById:`, error);
      return null;
    }
  }

  async createScenario(data) {
    try {
      const scenario = await Scenario.create(data);
      logger.info(`✅ Scenario created: ${scenario.id}`);
      return scenario;
    } catch (error) {
      logger.error(`Error in createScenario:`, error);
      throw error;
    }
  }

  async startScenario(userId, scenarioId) {
    try {
      const scenario = await Scenario.findByPk(scenarioId);
      if (!scenario) throw new Error("Scenario not found");

      const existing = await ScenarioSession.findOne({
        where: { userId, scenarioId, status: "in_progress" },
      });

      if (existing) {
        return { session: existing, scenario, isExisting: true };
      }

      const session = await ScenarioSession.create({
        userId,
        scenarioId,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        status: "in_progress",
        startedAt: new Date(),
        xpEarned: 0,
      });

      return { session, scenario, isExisting: false };
    } catch (error) {
      logger.error(`Error in startScenario:`, error);
      throw error;
    }
  }

  async submitStep(userId, scenarioId, stepIndex, answer) {
    try {
      const session = await ScenarioSession.findOne({
        where: { userId, scenarioId, status: "in_progress" },
      });

      if (!session) throw new Error("Session not found");

      const scenario = await Scenario.findByPk(scenarioId);
      if (!scenario) throw new Error("Scenario not found");

      const steps = scenario.steps || [];
      const currentStep = steps[stepIndex];
      if (!currentStep) throw new Error("Step not found");

      let isCorrect = false;
      let correctAnswer = null;

      if (currentStep.options) {
        const selected = currentStep.options.find((opt) => opt.id === answer);
        if (selected) {
          isCorrect = selected.correct === true;
          correctAnswer = currentStep.options.find((opt) => opt.correct === true);
        }
      }

      const isLastStep = stepIndex >= steps.length - 1;
      let xpEarned = 0;
      let completed = false;

      if (isCorrect && isLastStep) {
        xpEarned = scenario.xpReward || 50;
        completed = true;
        await session.update({
          status: "completed",
          completedAt: new Date(),
          xpEarned: xpEarned,
        });
        await userService.addXP(userId, xpEarned, "scenario_completion");
      } else if (isCorrect) {
        const metadata = session.metadata || {};
        if (!metadata.completedSteps) metadata.completedSteps = [];
        if (!metadata.completedSteps.includes(stepIndex)) {
          metadata.completedSteps.push(stepIndex);
        }
        await session.update({ metadata });
      }

      return {
        isCorrect,
        isLastStep,
        completed,
        xpEarned,
        feedback: isCorrect
          ? currentStep.feedback || { fa: "درست!", en: "Correct!", de: "Richtig!" }
          : {
              fa: "اشتباه، دوباره تلاش کنید",
              en: "Wrong, try again",
              de: "Falsch, versuchen Sie es erneut",
            },
        correctAnswer: correctAnswer?.text || null,
      };
    } catch (error) {
      logger.error(`Error in submitStep:`, error);
      throw error;
    }
  }

  async getProgress(userId, scenarioId) {
    try {
      const sessions = await ScenarioSession.findAll({
        where: { userId, scenarioId },
        order: [["createdAt", "DESC"]],
      });

      const completed = sessions.filter((s) => s.status === "completed");
      const active = sessions.find((s) => s.status === "in_progress");

      return {
        totalSessions: sessions.length,
        completedSessions: completed.length,
        activeSession: active || null,
        lastSession: sessions[0] || null,
        totalXP: completed.reduce((sum, s) => sum + (s.xpEarned || 0), 0),
      };
    } catch (error) {
      logger.error(`Error in getProgress:`, error);
      return { totalSessions: 0, completedSessions: 0, totalXP: 0 };
    }
  }

  async getStats(userId) {
    try {
      const totalScenarios = await Scenario.count({ where: { isActive: true } });
      const sessions = await ScenarioSession.findAll({ where: { userId } });
      const completed = sessions.filter((s) => s.status === "completed").length;
      const inProgress = sessions.filter((s) => s.status === "in_progress").length;
      const totalXP = sessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);

      return {
        totalScenarios,
        completed,
        inProgress,
        totalXP,
        completionRate: totalScenarios > 0 ? Math.round((completed / totalScenarios) * 100) : 0,
      };
    } catch (error) {
      logger.error(`Error in getStats:`, error);
      return { totalScenarios: 0, completed: 0, inProgress: 0, totalXP: 0 };
    }
  }
}

export default new ScenarioService();
