/**
 * scenarioController.js
 * Path: backend/controllers/scenarioController.js
 * Description: Scenario controller for handling scenario API requests
 */

import { Scenario, ScenarioSession } from "../models/index.js";
import logger from "../config/logger.js";

/**
 * دریافت همه سناریوها
 * GET /api/scenarios
 */
export const getScenarios = async (req, res) => {
  try {
    const scenarios = await Scenario.findAll({
      where: { isActive: true },
      order: [["level", "ASC"]],
    });

    res.json({
      success: true,
      data: scenarios,
    });
  } catch (error) {
    logger.error("Error getting scenarios:", error);
    res.status(500).json({
      success: false,
      message: "Error getting scenarios",
    });
  }
};

/**
 * دریافت سناریو با ID
 * GET /api/scenarios/:id
 */
export const getScenarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const scenario = await Scenario.findByPk(id);

    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }

    res.json({
      success: true,
      data: scenario,
    });
  } catch (error) {
    logger.error("Error getting scenario:", error);
    res.status(500).json({
      success: false,
      message: "Error getting scenario",
    });
  }
};

/**
 * شروع سناریو
 * POST /api/scenarios/:id/start
 */
export const startScenario = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const scenario = await Scenario.findByPk(id);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }

    // بررسی是否存在 جلسه فعال
    const existingSession = await ScenarioSession.findOne({
      where: {
        userId,
        scenarioId: id,
        status: "in_progress",
      },
    });

    if (existingSession) {
      return res.json({
        success: true,
        data: {
          session: existingSession,
          scenario,
          currentStep: 0,
          totalSteps: scenario.steps?.length || 0,
          isExisting: true,
        },
      });
    }

    const session = await ScenarioSession.create({
      userId,
      scenarioId: id,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      status: "in_progress",
      startedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        session,
        scenario,
        currentStep: 0,
        totalSteps: scenario.steps?.length || 0,
        isExisting: false,
      },
    });
  } catch (error) {
    logger.error("Error starting scenario:", error);
    res.status(500).json({
      success: false,
      message: "Error starting scenario",
    });
  }
};

/**
 * ارسال پاسخ مرحله
 * POST /api/scenarios/:id/step
 */
export const submitStep = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { stepIndex, answer } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (stepIndex === undefined || answer === undefined) {
      return res.status(400).json({
        success: false,
        message: "stepIndex and answer are required",
      });
    }

    const session = await ScenarioSession.findOne({
      where: {
        userId,
        scenarioId: id,
        status: "in_progress",
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or already completed",
      });
    }

    const scenario = await Scenario.findByPk(id);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }

    const steps = scenario.steps || [];
    const currentStep = steps[stepIndex];

    if (!currentStep) {
      return res.status(400).json({
        success: false,
        message: "Step not found",
      });
    }

    // بررسی پاسخ
    let isCorrect = false;
    let correctAnswer = null;

    if (currentStep.options && Array.isArray(currentStep.options)) {
      const selectedOption = currentStep.options.find((opt) => opt.id === answer);
      if (selectedOption) {
        isCorrect = selectedOption.isCorrect === true;
        correctAnswer = currentStep.options.find((opt) => opt.isCorrect === true);
      }
    }

    const isLastStep = stepIndex >= steps.length - 1;

    let response = {
      success: true,
      data: {
        isCorrect,
        isLastStep,
        currentStep: stepIndex,
        totalSteps: steps.length,
        feedback: isCorrect
          ? currentStep.correctFeedback || { fa: "✅ درست!", en: "✅ Correct!", de: "✅ Richtig!" }
          : currentStep.wrongFeedback || {
              fa: "❌ اشتباه، دوباره تلاش کنید",
              en: "❌ Wrong, try again",
              de: "❌ Falsch, versuchen Sie es erneut",
            },
      },
    };

    if (isCorrect && isLastStep) {
      // تکمیل سناریو
      await session.update({
        status: "completed",
        completedAt: new Date(),
        xpEarned: scenario.xpReward || 50,
      });

      response.data.completed = true;
      response.data.xpEarned = scenario.xpReward || 50;
      response.data.message = {
        fa: `🎉 سناریو با موفقیت کامل شد! ${scenario.xpReward || 50} XP دریافت کردید.`,
        en: `🎉 Scenario completed successfully! You earned ${scenario.xpReward || 50} XP.`,
        de: `🎉 Szenario erfolgreich abgeschlossen! Sie haben ${scenario.xpReward || 50} XP erhalten.`,
      };
    }

    if (isCorrect) {
      // ذخیره پیشرفت در metadata
      const metadata = session.metadata || {};
      if (!metadata.completedSteps) {
        metadata.completedSteps = [];
      }
      if (!metadata.completedSteps.includes(stepIndex)) {
        metadata.completedSteps.push(stepIndex);
      }
      await session.update({ metadata });
    }

    res.json(response);
  } catch (error) {
    logger.error("Error submitting step:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting step",
    });
  }
};

/**
 * دریافت پیشرفت سناریو
 * GET /api/scenarios/:id/progress
 */
export const getScenarioProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const sessions = await ScenarioSession.findAll({
      where: {
        userId,
        scenarioId: id,
      },
      order: [["createdAt", "DESC"]],
    });

    const activeSession = sessions.find((s) => s.status === "in_progress");
    const completedSessions = sessions.filter((s) => s.status === "completed");

    res.json({
      success: true,
      data: {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        activeSession: activeSession || null,
        lastSession: sessions[0] || null,
        totalXP: completedSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0),
      },
    });
  } catch (error) {
    logger.error("Error getting scenario progress:", error);
    res.status(500).json({
      success: false,
      message: "Error getting scenario progress",
    });
  }
};

/**
 * دریافت آمار کلی سناریوها برای کاربر
 * GET /api/scenarios/stats
 */
export const getScenarioStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const totalScenarios = await Scenario.count({ where: { isActive: true } });

    const sessions = await ScenarioSession.findAll({
      where: { userId },
    });

    const completed = sessions.filter((s) => s.status === "completed").length;
    const inProgress = sessions.filter((s) => s.status === "in_progress").length;
    const totalXP = sessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);

    res.json({
      success: true,
      data: {
        totalScenarios,
        completed,
        inProgress,
        totalXP,
        completionRate: totalScenarios > 0 ? Math.round((completed / totalScenarios) * 100) : 0,
      },
    });
  } catch (error) {
    logger.error("Error getting scenario stats:", error);
    res.status(500).json({
      success: false,
      message: "Error getting scenario stats",
    });
  }
};
