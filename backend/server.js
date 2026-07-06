/**
 * server.js
 * Path: backend/server.js
 * Description: Server entry point
 * Changes:
 * - ✅ Fixed import of config (default import)
 * - ✅ Added graceful shutdown
 * - ✅ Added error handling
 */

import app, { startServer, shutdown } from "./app.js";
import logger from "./config/logger.js";

// ============================================
// 🚀 Start Server
// ============================================

const PORT = process.env.PORT || 5001;

// Start the server
startServer().catch((error) => {
  logger.error("❌ Failed to start server:", error);
  process.exit(1);
});

// ============================================
// 🛑 Graceful Shutdown
// ============================================

process.on("SIGTERM", async () => {
  logger.info("🛑 SIGTERM received, shutting down gracefully...");
  await shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("🛑 SIGINT received, shutting down gracefully...");
  await shutdown();
  process.exit(0);
});

// ============================================
// ❌ Unhandled Rejections
// ============================================

process.on("unhandledRejection", (reason, promise) => {
  logger.error("❌ Unhandled Rejection at:", {
    promise,
    reason: reason instanceof Error ? reason.message : reason,
  });
});

process.on("uncaughtException", (error) => {
  logger.error("❌ Uncaught Exception:", error);
  shutdown().then(() => {
    process.exit(1);
  });
});

logger.info(`🚀 Server starting on port ${PORT}`);
