/**
 * aiController.js
 * Path: backend/controllers/aiController.js
 * Description: AI controller with all endpoints
 * Changes:
 * - ✅ FIXED: Use snake_case column names for ORDER BY (created_at)
 * - ✅ FIXED: getConversations now properly returns data
 * - ✅ FIXED: getConversationById added
 * - ✅ FIXED: All column names use snake_case
 */

import aiService from "../services/aiService.js";
import AIConversation from "../models/AIConversation.js";
import userService from "../services/userService.js";
import {
  validateChat,
  validateGrammarCorrection,
  validateTranslation,
  validateGrammarExplanation,
  validateScenarioStart,
  validateScenarioContinue,
} from "../validators/ai.validator.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { ValidationError } from "../errors/index.js";
import { Op } from "sequelize";
import logger from "../config/logger.js";

/**
 * Chat with AI
 * POST /api/ai/chat
 */
export const chat = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  const validation = validateChat(data);
  if (!validation.valid) {
    throw new ValidationError({
      message: "Validation failed",
      details: validation.errors,
    });
  }

  const { message, level, sessionId, context } = validation.data;

  // Get conversation history - ✅ FIXED: use snake_case
  const history = await AIConversation.findAll({
    where: {
      userId,
      sessionId,
    },
    order: [["created_at", "ASC"]],
    limit: 10,
  });

  const aiContext = {
    userId,
    level: String(level),
    nativeLanguage: req.user.nativeLanguage || "fa",
    role: context.role || "tutor",
    topic: context.topic || "general",
    messages: history.map((h) => ({
      role: h.sender,
      content: h.message,
    })),
  };

  const response = await aiService.generateResponse(userId, message, level, aiContext);

  // Save conversation
  await AIConversation.create({
    userId,
    sessionId,
    message: message,
    sender: "user",
  });

  await AIConversation.create({
    userId,
    sessionId,
    message: response.text,
    sender: "assistant",
  });

  await userService.addXP(userId, 5, "ai_chat");

  res.json({
    success: true,
    data: {
      response: response.text,
      sessionId,
      xpGained: 5,
      provider: response.provider,
      isMock: response.isMock,
    },
  });
});

/**
 * Grammar correction
 * POST /api/ai/grammar/correct
 */
export const correctGrammar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  const validation = validateGrammarCorrection(data);
  if (!validation.valid) {
    throw new ValidationError({
      message: "Validation failed",
      details: validation.errors,
    });
  }

  const result = await aiService.correctGrammar(validation.data.text, userId);

  await userService.addXP(userId, 3, "grammar_correction");

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Translate to German
 * POST /api/ai/translate
 */
export const translateToGerman = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  const validation = validateTranslation(data);
  if (!validation.valid) {
    throw new ValidationError({
      message: "Validation failed",
      details: validation.errors,
    });
  }

  const result = await aiService.translateToGerman(
    validation.data.text,
    validation.data.nativeLanguage || "fa"
  );

  await userService.addXP(userId, 3, "translation");

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Grammar explanation
 * POST /api/ai/grammar/explain
 */
export const explainGrammar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  const validation = validateGrammarExplanation(data);
  if (!validation.valid) {
    throw new ValidationError({
      message: "Validation failed",
      details: validation.errors,
    });
  }

  const result = await aiService.explainGrammar(
    validation.data.concept,
    validation.data.level || "A1",
    validation.data.nativeLanguage || "fa"
  );

  await userService.addXP(userId, 5, "grammar_explanation");

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Generate exercise
 * POST /api/ai/exercise/generate
 */
export const generateExercise = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { topic, level = "A1", count = 5 } = req.body;

  if (!topic) {
    throw new ValidationError({
      message: "Topic is required",
      details: [{ field: "topic", message: "Topic is required" }],
    });
  }

  const result = await aiService.generateExercise(topic, level, count);

  await userService.addXP(userId, 5, "exercise_generation");

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Start scenario
 * POST /api/ai/scenario/start
 */
export const startScenario = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  const validation = validateScenarioStart(data);
  if (!validation.valid) {
    throw new ValidationError({
      message: "Validation failed",
      details: validation.errors,
    });
  }

  const result = await aiService.startScenario(
    validation.data.scenarioType,
    validation.data.level || "A1"
  );

  const sessionId = `scenario_${Date.now()}`;

  await AIConversation.create({
    userId,
    sessionId,
    message: `[Scenario: ${validation.data.scenarioType}] Started`,
    sender: "system",
  });

  await AIConversation.create({
    userId,
    sessionId,
    message: result.text,
    sender: "assistant",
  });

  res.json({
    success: true,
    data: {
      sessionId,
      response: result.text,
      scenarioType: validation.data.scenarioType,
    },
  });
});

/**
 * Continue scenario
 * POST /api/ai/scenario/continue
 */
export const continueScenario = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  const validation = validateScenarioContinue(data);
  if (!validation.valid) {
    throw new ValidationError({
      message: "Validation failed",
      details: validation.errors,
    });
  }

  const { sessionId, message } = validation.data;

  // Get conversation history - ✅ FIXED: use snake_case
  const history = await AIConversation.findAll({
    where: {
      userId,
      sessionId,
      sender: {
        [Op.in]: ["user", "assistant"],
      },
    },
    order: [["created_at", "ASC"]],
  });

  const conversationHistory = history.map((h) => `${h.sender}: ${h.message}`).join("\n");

  const result = await aiService.continueScenario(conversationHistory, message);

  await AIConversation.create({
    userId,
    sessionId,
    message: message,
    sender: "user",
  });

  await AIConversation.create({
    userId,
    sessionId,
    message: result.text,
    sender: "assistant",
  });

  await userService.addXP(userId, 5, "scenario_practice");

  res.json({
    success: true,
    data: {
      response: result.text,
      sessionId,
    },
  });
});

/**
 * Get conversation history
 * GET /api/ai/history
 */
export const getConversationHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sessionId = "default", limit = 50 } = req.query;

  // ✅ FIXED: use snake_case
  const history = await AIConversation.findAll({
    where: {
      userId,
      sessionId,
    },
    order: [["created_at", "ASC"]],
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: history,
  });
});

/**
 * Get conversations list (for AiTutorPage)
 * GET /api/ai/conversations
 * ✅ FIXED: Now properly returns data with messages
 */
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 20, offset = 0 } = req.query;

  logger.info(`📊 Getting conversations for user ${userId}`);

  // Get distinct session IDs with latest message
  const conversations = await AIConversation.findAll({
    where: { userId },
    attributes: [
      "sessionId",
      [
        AIConversation.sequelize.fn("MAX", AIConversation.sequelize.col("created_at")),
        "lastMessageAt",
      ],
      [AIConversation.sequelize.fn("COUNT", AIConversation.sequelize.col("id")), "messageCount"],
    ],
    group: ["sessionId"],
    order: [[AIConversation.sequelize.literal('"lastMessageAt"'), "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // Get messages for each conversation
  const result = await Promise.all(
    conversations.map(async (conv) => {
      const messages = await AIConversation.findAll({
        where: {
          userId,
          sessionId: conv.sessionId,
        },
        order: [["created_at", "ASC"]],
        limit: 50,
      });

      return {
        sessionId: conv.sessionId,
        lastMessageAt: conv.get("lastMessageAt"),
        messageCount: parseInt(conv.get("messageCount")),
        messages: messages.map((m) => ({
          id: m.id,
          sender: m.sender,
          message: m.message,
          created_at: m.created_at,
        })),
      };
    })
  );

  res.json({
    success: true,
    data: result,
    total: result.length,
  });
});

/**
 * Get conversation by session ID
 * GET /api/ai/conversations/:sessionId
 */
export const getConversationById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new ValidationError({
      message: "sessionId is required",
      details: [{ field: "sessionId", message: "sessionId is required" }],
    });
  }

  // ✅ FIXED: use snake_case
  const messages = await AIConversation.findAll({
    where: {
      userId,
      sessionId,
    },
    order: [["created_at", "ASC"]],
  });

  res.json({
    success: true,
    data: {
      sessionId,
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        message: m.message,
        created_at: m.created_at,
      })),
      count: messages.length,
    },
  });
});

/**
 * Clear conversation history
 * DELETE /api/ai/history/:sessionId
 */
export const deleteHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new ValidationError({
      message: "sessionId is required",
      details: [{ field: "sessionId", message: "sessionId is required" }],
    });
  }

  const deletedCount = await AIConversation.destroy({
    where: {
      userId,
      sessionId,
    },
  });

  res.json({
    success: true,
    message: "Conversation history cleared",
    data: { deletedCount },
  });
});

/**
 * Get sessions list
 * GET /api/ai/sessions
 */
export const getSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // ✅ FIXED: use snake_case
  const sessions = await AIConversation.findAll({
    where: {
      userId,
      sender: "assistant",
    },
    attributes: [
      "sessionId",
      [
        AIConversation.sequelize.fn("MAX", AIConversation.sequelize.col("created_at")),
        "lastMessageAt",
      ],
    ],
    group: ["sessionId"],
    order: [[AIConversation.sequelize.literal('"lastMessageAt"'), "DESC"]],
    limit: 20,
  });

  res.json({
    success: true,
    data: sessions,
  });
});
