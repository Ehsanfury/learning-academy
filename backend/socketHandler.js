/**
 * socketHandler.js
 * Path: backend/socketHandler.js
 * Description: Socket.IO handler with authentication
 * Changes:
 * - ✅ FIXED: JWT_SECRET from config.jwt.accessSecret
 * - ✅ Added authentication middleware
 * - ✅ Added user validation for room joining
 * - ✅ Added proper error handling
 * - ✅ Added logging for connections
 */

import jwt from "jsonwebtoken";
import config from "./config/env.js";
import logger from "./config/logger.js";
import { User } from "./models/index.js";

// ✅ FIXED: Use config.jwt.accessSecret
const JWT_SECRET = config.jwt.accessSecret;

/**
 * Setup Socket.IO with authentication
 * @param {Object} io - Socket.IO instance
 */
function setupSocket(io) {
  // ============================================
  // 🔐 Authentication Middleware
  // ============================================

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        logger.warn(`⚠️ Socket connection attempt without token from ${socket.handshake.address}`);
        return next(new Error("Authentication required"));
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check if user exists
      const user = await User.findByPk(decoded.id);
      if (!user) {
        logger.warn(`⚠️ Socket connection attempt with invalid user: ${decoded.id}`);
        return next(new Error("User not found"));
      }

      // Attach user info to socket
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.user = user;

      logger.info(`✅ Socket authenticated for user: ${user.email} (${socket.id})`);
      next();
    } catch (error) {
      logger.error(`❌ Socket authentication error: ${error.message}`);
      next(new Error("Invalid token"));
    }
  });

  // ============================================
  // 📡 Connection Handler
  // ============================================

  io.on("connection", (socket) => {
    const userId = socket.userId;
    logger.info(`✅ User ${userId} connected to socket (${socket.id})`);

    // ============================================
    // 📍 Room Management
    // ============================================

    /**
     * Join a room (with permission check)
     */
    socket.on("join-room", async (roomId, callback) => {
      try {
        if (roomId.startsWith("user-") && roomId !== `user-${userId}`) {
          logger.warn(`⚠️ User ${userId} attempted to join unauthorized room: ${roomId}`);
          callback({ success: false, error: "Access denied to this room" });
          return;
        }

        const rooms = Array.from(socket.rooms);
        rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        socket.join(roomId);
        logger.info(`📌 User ${userId} joined room: ${roomId}`);

        callback({ success: true, room: roomId });
      } catch (error) {
        logger.error(`❌ Error joining room ${roomId}: ${error.message}`);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * Leave a room
     */
    socket.on("leave-room", (roomId, callback) => {
      try {
        socket.leave(roomId);
        logger.info(`📌 User ${userId} left room: ${roomId}`);
        callback({ success: true });
      } catch (error) {
        logger.error(`❌ Error leaving room ${roomId}: ${error.message}`);
        callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // 💬 Messaging
    // ============================================

    socket.on("send-message", async (data, callback) => {
      try {
        const { roomId, message, type = "text" } = data;

        if (!roomId || !message) {
          callback({ success: false, error: "Room ID and message are required" });
          return;
        }

        if (!socket.rooms.has(roomId)) {
          logger.warn(`⚠️ User ${userId} attempted to send message to room not joined: ${roomId}`);
          callback({ success: false, error: "Not a member of this room" });
          return;
        }

        const messageData = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId,
          userName: socket.user?.name || "User",
          message,
          type,
          timestamp: new Date().toISOString(),
        };

        io.to(roomId).emit("new-message", messageData);

        logger.info(`💬 Message sent from user ${userId} to room ${roomId}`);
        callback({ success: true, message: messageData });
      } catch (error) {
        logger.error(`❌ Error sending message: ${error.message}`);
        callback({ success: false, error: error.message });
      }
    });

    socket.on("typing", (data) => {
      const { roomId, isTyping } = data;

      if (socket.rooms.has(roomId)) {
        socket.to(roomId).emit("user-typing", {
          userId,
          userName: socket.user?.name || "User",
          isTyping,
        });
      }
    });

    // ============================================
    // 👤 User Status
    // ============================================

    socket.on("update-status", async (status, callback) => {
      try {
        io.emit("user-status-change", {
          userId,
          status,
          timestamp: new Date().toISOString(),
        });

        logger.info(`👤 User ${userId} status updated to: ${status}`);
        callback({ success: true });
      } catch (error) {
        logger.error(`❌ Error updating status: ${error.message}`);
        callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // 🔔 Notifications
    // ============================================

    socket.on("send-notification", (data, callback) => {
      try {
        const { targetUserId, notification } = data;

        const targetSockets = io.sockets.sockets;
        let found = false;

        for (const [socketId, targetSocket] of targetSockets) {
          if (targetSocket.userId === targetUserId) {
            targetSocket.emit("notification", notification);
            found = true;
            break;
          }
        }

        if (found) {
          logger.info(`🔔 Notification sent to user ${targetUserId}`);
          callback({ success: true });
        } else {
          logger.warn(`⚠️ User ${targetUserId} not connected`);
          callback({ success: false, error: "User not connected" });
        }
      } catch (error) {
        logger.error(`❌ Error sending notification: ${error.message}`);
        callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // 💓 Heartbeat / Ping
    // ============================================

    socket.on("ping", (callback) => {
      const timestamp = new Date().toISOString();
      socket.emit("pong", { timestamp });
      if (callback) {
        callback({ timestamp });
      }
    });

    // ============================================
    // 🔌 Disconnect
    // ============================================

    socket.on("disconnect", () => {
      logger.info(`🔌 User ${userId} disconnected (${socket.id})`);

      io.emit("user-offline", {
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("error", (error) => {
      logger.error(`❌ Socket error for user ${userId}: ${error.message}`);
    });

    // ============================================
    // 📢 Welcome Message
    // ============================================

    socket.emit("welcome", {
      userId,
      socketId: socket.id,
      message: "Connected to Learning Academy socket server",
      timestamp: new Date().toISOString(),
    });

    socket.broadcast.emit("user-online", {
      userId,
      userName: socket.user?.name || "User",
      timestamp: new Date().toISOString(),
    });
  });

  // ============================================
  // 📊 Admin Functions
  // ============================================

  io.getConnectedCount = () => {
    return io.sockets.sockets.size;
  };

  io.getConnectedUsers = () => {
    const users = [];
    for (const [socketId, socket] of io.sockets.sockets) {
      if (socket.userId) {
        users.push({
          socketId,
          userId: socket.userId,
          userName: socket.user?.name || "User",
          connectedAt: socket.handshake?.time || new Date().toISOString(),
        });
      }
    }
    return users;
  };

  logger.info("✅ Socket.IO server initialized with authentication");
  return io;
}

export default setupSocket;
