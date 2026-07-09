/**
 * socketHandler.js
 * Path: backend/socketHandler.js
 * Description: WebSocket connection management with JWT authentication
 * Changes:
 * - ✅ FIXED: Added user.isActive check
 * - ✅ FIXED: JWT authentication middleware
 * - ✅ FIXED: Room access restricted to authenticated users
 * - ✅ FIXED: Proper error handling
 */

import jwt from "jsonwebtoken";
import { User } from "./models/index.js";
import logger from "./config/logger.js";
import config from "./config/env.js";

const JWT_SECRET = config.jwt.accessSecret;

/**
 * Authenticate socket connection with JWT
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      logger.warn(`🔌 Socket ${socket.id} connection rejected: No token provided`);
      return next(new Error("Authentication required"));
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      logger.warn(`🔌 Socket ${socket.id} connection rejected: User not found`);
      return next(new Error("User not found"));
    }

    // ✅ FIXED: Check if user is active
    if (!user.isActive) {
      logger.warn(`🔌 Socket ${socket.id} connection rejected: Account deactivated`);
      return next(new Error("Account deactivated"));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user.id;

    logger.info(`🔌 Socket ${socket.id} authenticated for user: ${user.id}`);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.warn(`🔌 Socket ${socket.id} connection rejected: Token expired`);
      return next(new Error("Token expired"));
    }
    if (error.name === "JsonWebTokenError") {
      logger.warn(`🔌 Socket ${socket.id} connection rejected: Invalid token`);
      return next(new Error("Invalid token"));
    }
    logger.error(`🔌 Socket ${socket.id} authentication error:`, error.message);
    return next(new Error("Authentication failed"));
  }
};

/**
 * Initialize Socket.IO with authentication
 */
export const initializeSocket = (io) => {
  // ✅ Use authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.userId;
    logger.info(`🔌 Client connected: ${socket.id} (User: ${userId})`);

    // Join user's personal room for private messages
    socket.join(`user:${userId}`);
    logger.info(`📨 Socket ${socket.id} joined user room: user:${userId}`);

    // ============================================
    // 📚 Lesson Rooms (Authenticated)
    // ============================================

    socket.on("join-lesson", (lessonId) => {
      if (!lessonId) {
        socket.emit("error", { message: "Lesson ID is required" });
        return;
      }

      socket.join(`lesson:${lessonId}`);
      logger.info(`📚 Socket ${socket.id} joined lesson:${lessonId} (User: ${userId})`);

      socket.to(`lesson:${lessonId}`).emit("user-joined", {
        userId: userId,
        timestamp: new Date(),
      });
    });

    socket.on("leave-lesson", (lessonId) => {
      if (!lessonId) return;

      socket.leave(`lesson:${lessonId}`);
      logger.info(`📚 Socket ${socket.id} left lesson:${lessonId} (User: ${userId})`);
    });

    // ============================================
    // 📝 Answer Submission (Authenticated)
    // ============================================

    socket.on("submit-answer", (data) => {
      const { lessonId, questionId, answer } = data;

      if (!lessonId || !questionId) {
        socket.emit("error", { message: "Lesson ID and Question ID are required" });
        return;
      }

      socket.to(`lesson:${lessonId}`).emit("answer-submitted", {
        userId: userId,
        questionId,
        answer,
        timestamp: new Date(),
      });
    });

    // ============================================
    // ⌨️ Typing Indicator (Authenticated)
    // ============================================

    socket.on("typing", (data) => {
      const { lessonId, isTyping } = data;

      if (!lessonId) {
        socket.emit("error", { message: "Lesson ID is required" });
        return;
      }

      socket.to(`lesson:${lessonId}`).emit("user-typing", {
        userId: userId,
        isTyping,
        timestamp: new Date(),
      });
    });

    // ============================================
    // 🤖 AI Tutor (Authenticated)
    // ============================================

    socket.on("join-ai-tutor", () => {
      socket.join(`ai:${userId}`);
      logger.info(`🤖 Socket ${socket.id} joined AI tutor for user:${userId}`);
    });

    socket.on("ai-message", async (data) => {
      const { message, mode, level } = data;

      if (!message) {
        socket.emit("error", { message: "Message is required" });
        return;
      }

      socket.emit("ai-thinking", { status: true });

      try {
        const aiService = (await import("./services/aiService.js")).default;

        const response = await aiService.chat(userId, message, level || "A1", {
          mode: mode || "general",
          nativeLanguage: "fa",
        });

        socket.emit("ai-response", {
          text: response.text,
          provider: response.provider,
          isMock: response.isMock,
          timestamp: new Date(),
        });
      } catch (error) {
        logger.error(`🤖 AI message error for user ${userId}:`, error.message);
        socket.emit("ai-error", {
          message: "Failed to process AI request",
          timestamp: new Date(),
        });
      } finally {
        socket.emit("ai-thinking", { status: false });
      }
    });

    // ============================================
    // 🔌 Disconnect
    // ============================================

    socket.on("disconnect", () => {
      logger.info(`🔌 Client disconnected: ${socket.id} (User: ${userId})`);
    });
  });
};

export default initializeSocket;
