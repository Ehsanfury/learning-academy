/**
 * app.js
 * Learning Academy
 * فایل اصلی Express Application
 * Changes:
 * - ✅ FIXED: aiLimiter properly connected to AI routes
 * - ✅ FIXED: All rate limiters imported and used correctly
 * - ✅ FIXED: Proper middleware order
 * - ✅ ADDED: adminRoutes for admin panel
 * - ✅ ADDED: ticketRoutes for support tickets
 * - ✅ ADDED: trackPageView middleware
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSwagger } from "./config/swagger.js";

// Config
import sequelize, { testConnection } from "./config/db.js";
import config, { isAIConfigured, isGeminiConfigured } from "./config/env.js";
import { logInfo, logError } from "./config/logger.js";

// Middlewares
import rateLimiter, {
  authLimiter,
  registerLimiter,
  storiesLimiter,
  aiLimiter,
  strictLimiter,
} from "./middlewares/rateLimiter.js";
import { trackActivity } from "./middlewares/activityMiddleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { authenticate } from "./middlewares/authMiddleware.js";
import { trackPageView } from "./middlewares/pageViewMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import dictionaryRoutes from "./routes/dictionaryRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import spacedRepetitionRoutes from "./routes/spacedRepetitionRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import vocabularyRoutes from "./routes/vocabularyRoutes.js";
import levelRoutes from "./routes/levelRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import storiesRoutes from "./routes/storiesRoutes.js";
import scenariosRoutes from "./routes/scenariosRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import journeyRoutes from "./routes/journeyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

// Socket Handler
import setupSocket from "./socketHandler.js";

// Models
import {
  User,
  Lesson,
  LessonProgress,
  WordProgress,
  Achievement,
  UserAchievement,
  AIConversation,
  Mentor,
  MentorSession,
  Notification,
  UserNotification,
  Vocabulary,
  Story,
  StoryProgress,
  Scenario,
  XPHistory,
  UserRefreshToken,
  Exercise,
  ScenarioSession,
  Ticket,
  PageView,
  SystemSetting,
} from "./models/index.js";

// ============================================
// ✅ Validate Imports (Debug) - Only in development
// ============================================

if (config.isDevelopment) {
  console.log("✅ Import validation:");
  console.log(
    "  - authenticate:",
    typeof authenticate === "function" ? "✅ function" : "❌ missing"
  );
  console.log(
    "  - trackActivity:",
    typeof trackActivity === "function" ? "✅ function" : "❌ missing"
  );
  console.log("  - levelRoutes:", typeof levelRoutes === "function" ? "✅ function" : "❌ missing");
  console.log("  - rateLimiter:", typeof rateLimiter === "function" ? "✅ function" : "❌ missing");
  console.log(
    "  - trackPageView:",
    typeof trackPageView === "function" ? "✅ function" : "❌ missing"
  );
  console.log("  - adminRoutes:", typeof adminRoutes === "function" ? "✅ function" : "❌ missing");
  console.log("  - aiLimiter:", typeof aiLimiter === "function" ? "✅ function" : "❌ missing");
}

// ============================================
// 🚀 Startup Guard
// ============================================

const checkProductionReadiness = () => {
  if (config.isProduction) {
    const jwtSecret = config.jwt?.accessSecret;
    const jwtRefreshSecret = config.jwt?.refreshSecret;

    const placeholderPatterns = [
      /your-.*-key/i,
      /change-this/i,
      /secret-key/i,
      /example/i,
      /placeholder/i,
      /dev-.*-secret/i,
    ];

    const isPlaceholder = (val) => {
      if (!val) return true;
      return placeholderPatterns.some((p) => p.test(val));
    };

    if (isPlaceholder(jwtSecret)) {
      console.error("❌ Fatal: JWT_SECRET is using a placeholder/development value in production!");
      process.exit(1);
    }

    if (isPlaceholder(jwtRefreshSecret)) {
      console.error(
        "❌ Fatal: JWT_REFRESH_SECRET is using a placeholder/development value in production!"
      );
      process.exit(1);
    }

    if (config.db?.password === "123456") {
      console.error("❌ Fatal: DB_PASSWORD is using default '123456' in production!");
      process.exit(1);
    }

    if (config.admin?.password === "admin123456" || !config.admin?.password) {
      console.error("❌ Fatal: ADMIN_PASSWORD is using default or not set in production!");
      process.exit(1);
    }

    if (!isAIConfigured()) {
      console.warn("⚠️ Warning: OPENROUTER_API_KEY is not configured in production.");
    }

    if (!isGeminiConfigured()) {
      console.warn("⚠️ Warning: GOOGLE_GEMINI_API_KEY is not configured in production.");
    }

    console.log("✅ Production readiness checks passed.");
  }
};

checkProductionReadiness();

// ============================================
// 🚀 Initialize Express
// ============================================

const app = express();
const httpServer = createServer(app);

// ============================================
// 🔌 Socket.IO Setup
// ============================================

const io = new Server(httpServer, {
  cors: {
    origin: config.cors?.origin || ["http://localhost:3000"],
    credentials: true,
  },
});

setupSocket(io);

// ============================================
// 🛡️ Trust Proxy (for rate limiting behind nginx)
// ============================================

app.set("trust proxy", 1);

// ============================================
// 🛡️ Middlewares
// ============================================

app.use(helmet());

// CORS configuration
const corsOrigins = config.cors?.origin || ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (corsOrigins.indexOf(origin) !== -1 || config.isDevelopment) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(compression());
setupSwagger(app);
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logInfo(message.trim()),
    },
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

// ============================================
// 🚦 Rate Limiting
// ============================================

// General rate limiter for all API routes
app.use("/api", rateLimiter);

// ============================================
// 📊 Page View Tracking (Admin Analytics)
// ============================================

app.use(trackPageView);

// ============================================
// 🏥 Health Check
// ============================================

app.get("/health", async (req, res) => {
  try {
    const isConnected = await testConnection();

    if (config.isProduction) {
      return res.status(isConnected ? 200 : 503).json({
        status: isConnected ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
      });
    }

    const health = {
      status: isConnected ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      services: {
        database: isConnected ? "connected" : "disconnected",
        ai: isAIConfigured() ? "configured" : "not configured",
        gemini: isGeminiConfigured() ? "configured" : "not configured",
        socket: io ? "running" : "not running",
      },
      version: "2.0.0",
    };

    res.status(isConnected ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      ...(config.isDevelopment ? { error: error.message } : {}),
    });
  }
});

// ============================================
// 🚏 PUBLIC ROUTES
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "Learning Academy API",
    version: "2.0.0",
    status: "running",
    environment: config.nodeEnv,
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      users: "/api/users",
      lessons: "/api/lessons",
      progress: "/api/progress",
      dictionary: "/api/dictionary",
      ai: "/api/ai",
      review: "/api/review",
      achievements: "/api/achievements",
      mentors: "/api/mentors",
      vocabulary: "/api/vocabulary",
      levels: "/api/levels",
      exercises: "/api/exercises",
      stories: "/api/stories",
      scenarios: "/api/scenarios",
      notifications: "/api/notifications",
      analytics: "/api/analytics",
      tickets: "/api/tickets",
    },
    documentation: "/api/docs",
  });
});

// ============================================
// 🔐 AUTH ROUTES (Public with rate limiting)
// ============================================

app.use("/api/auth", authLimiter, authRoutes);

// ============================================
// 🔐 PROTECTED ROUTES
// ============================================

app.use("/api/users", trackActivity, userRoutes);
app.use("/api/lessons", trackActivity, lessonRoutes);
app.use("/api/progress", trackActivity, progressRoutes);
app.use("/api/dictionary", trackActivity, dictionaryRoutes);

// ✅ FIXED: AI routes now have their own rate limiter
app.use("/api/ai", aiLimiter, trackActivity, aiRoutes);

app.use("/api/review", trackActivity, spacedRepetitionRoutes);
app.use("/api/achievements", trackActivity, achievementRoutes);
app.use("/api/mentors", trackActivity, mentorRoutes);
app.use("/api/vocabulary", trackActivity, vocabularyRoutes);
app.use("/api/levels", trackActivity, levelRoutes);
app.use("/api/exercises", trackActivity, exerciseRoutes);
app.use("/api/stories", authenticate, trackActivity, storiesLimiter, storiesRoutes);
app.use("/api/scenarios", authenticate, trackActivity, scenariosRoutes);
app.use("/api/notifications", trackActivity, notificationRoutes);
app.use("/api/analytics", trackActivity, analyticsRoutes);
app.use("/api/journey", authenticate, trackActivity, journeyRoutes);

// ============================================
// 🎫 TICKET ROUTES (Protected)
// ============================================

app.use("/api/tickets", authenticate, ticketRoutes);

// ============================================
// 👑 ADMIN ROUTES (Admin Only)
// ============================================

app.use("/api/admin", adminRoutes);

// ============================================
// 📚 API Documentation
// ============================================

app.get("/api/docs", (req, res) => {
  res.json({
    name: "Learning Academy API",
    version: "2.0.0",
    description: "API for Learning Academy - AI-Powered Language Learning Platform",
    endpoints: [
      {
        path: "/api/auth",
        methods: ["POST /register", "POST /login", "POST /refresh-token", "POST /logout"],
        description: "Authentication endpoints",
      },
      {
        path: "/api/users",
        methods: ["GET /profile", "PUT /profile", "GET /stats", "GET /streak", "GET /activity"],
        description: "User management endpoints",
      },
      {
        path: "/api/lessons",
        methods: ["GET /", "GET /:id", "POST /:id/complete", "GET /stats", "GET /suggestions"],
        description: "Lesson management endpoints",
      },
      {
        path: "/api/progress",
        methods: ["GET /", "POST /", "GET /stats", "GET /lesson/:lessonId", "GET /in-progress"],
        description: "Progress tracking endpoints",
      },
      {
        path: "/api/ai",
        methods: [
          "POST /chat",
          "POST /grammar/correct",
          "POST /translate",
          "POST /grammar/explain",
          "POST /exercise/generate",
          "POST /scenario/start",
          "POST /scenario/continue",
        ],
        description: "AI service endpoints",
      },
      {
        path: "/api/mentors",
        methods: ["GET /", "POST /register", "POST /:id/book", "GET /my-sessions"],
        description: "Mentor system endpoints",
      },
      {
        path: "/api/vocabulary",
        methods: ["GET /words", "POST /saved/:wordId", "GET /categories", "POST /review/:wordId"],
        description: "Vocabulary management endpoints",
      },
      {
        path: "/api/levels",
        methods: ["GET /", "GET /:levelId", "GET /:levelId/progress"],
        description: "Level management endpoints",
      },
      {
        path: "/api/exercises",
        methods: ["POST /generate", "POST /submit", "GET /types", "GET /levels"],
        description: "Exercise engine endpoints",
      },
      {
        path: "/api/stories",
        methods: ["GET /", "GET /:id", "POST /:id/start", "PUT /:id/progress"],
        description: "Interactive stories endpoints",
      },
      {
        path: "/api/scenarios",
        methods: ["GET /", "GET /:id", "POST /start", "POST /continue"],
        description: "Real-life scenario endpoints",
      },
      {
        path: "/api/achievements",
        methods: ["GET /", "GET /my", "GET /unviewed", "PUT /:id/view", "GET /stats"],
        description: "Achievement system endpoints",
      },
      {
        path: "/api/review",
        methods: ["POST /word/:id", "GET /due", "GET /stats"],
        description: "Spaced repetition system endpoints",
      },
      {
        path: "/api/notifications",
        methods: ["GET /", "PUT /:id/read", "PUT /read-all", "GET /unread-count"],
        description: "Notification system endpoints",
      },
      {
        path: "/api/analytics",
        methods: ["POST /event", "GET /stats", "GET /weekly-activity", "GET /insights"],
        description: "Analytics endpoints",
      },
      {
        path: "/api/tickets",
        methods: ["POST /", "GET /", "GET /:id", "PUT /:id/close", "PUT /:id/rate"],
        description: "Support ticket endpoints",
      },
      {
        path: "/api/admin",
        methods: [
          "GET /dashboard",
          "GET /users",
          "GET /users/:id",
          "PUT /users/:id",
          "DELETE /users/:id",
          "PUT /users/:id/role",
          "PUT /users/:id/status",
          "GET /lessons",
          "POST /lessons",
          "PUT /lessons/:id",
          "DELETE /lessons/:id",
          "GET /analytics",
          "GET /tickets",
          "POST /tickets/:id/reply",
          "GET /settings",
          "PUT /settings",
          "GET /health",
        ],
        description: "Admin panel endpoints",
      },
    ],
  });
});

// ============================================
// ❌ 404 & Error Handlers
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// 🔄 Database Initialization
// ============================================

export const initializeDatabase = async () => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    // Sync schema in both dev and prod (safe mode: no alter, no force).
    // Set DB_SYNC=false to disable (e.g., when using migrations only).
    const shouldSync = process.env.DB_SYNC !== "false";
    if (shouldSync) {
      await sequelize.sync({ alter: false, force: false });
      logInfo(`✅ Database synced (${config.nodeEnv} mode)`);
    } else {
      logInfo("✅ Database connection verified (sync disabled via DB_SYNC=false)");
    }

    const adminEmail = config.admin?.email || "admin@german-academy.com";
    const adminExists = await User.findOne({
      where: { email: adminEmail },
    });

    if (!adminExists) {
      const adminPassword = config.admin?.password;
      if (!adminPassword) {
        logInfo("⚠️ ADMIN_PASSWORD is not set in .env — Admin user creation skipped.");
      } else {
        // The production-readiness guard already blocks default admin passwords.
        // Create the admin user if ADMIN_PASSWORD is set.
        await User.create({
          name: "Admin",
          email: adminEmail,
          password: adminPassword,
          role: "admin",
          isActive: true,
          emailVerified: true,
        });
        logInfo(`✅ Admin user created: ${adminEmail}`);
      }
    } else if (adminExists.role !== "admin") {
      await adminExists.update({ role: "admin" });
      logInfo("✅ Admin user role backfilled");
    }

    const achievementCount = await Achievement.count();
    if (achievementCount === 0 && Achievement.seedDefaults) {
      await Achievement.seedDefaults();
      logInfo("✅ Default achievements seeded");
    }

    // ✅ Seed default system settings
    const settingsCount = await SystemSetting.count();
    if (settingsCount === 0 && SystemSetting.seedDefaults) {
      await SystemSetting.seedDefaults();
      logInfo("✅ Default system settings seeded");
    }

    logInfo("✅ Database initialization completed successfully");
    return true;
  } catch (error) {
    logError("❌ Database initialization failed", error);
    throw error;
  }
};

// ============================================
// 🚀 Server Start
// ============================================

const PORT = config.port || 5001;

export const startServer = async () => {
  try {
    await initializeDatabase();

    httpServer.listen(PORT, () => {
      logInfo(`🚀 Server running on port ${PORT}`);
      logInfo(`📍 Health check: http://localhost:${PORT}/health`);
      logInfo(`🔌 Socket.IO running on port ${PORT}`);
      logInfo(`🌐 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logError("❌ Server startup error:", error);
    process.exit(1);
  }
};

// ============================================
// 🚀 Graceful Shutdown
// ============================================

export const shutdown = async () => {
  try {
    logInfo("🛑 Shutting down gracefully...");

    if (io) {
      io.close(() => {
        logInfo("✅ Socket.IO closed");
      });
    }

    await sequelize.close();
    logInfo("✅ Database connection closed");

    httpServer.close(() => {
      logInfo("✅ HTTP server closed");
    });

    logInfo("✅ Shutdown complete");
  } catch (error) {
    logError("❌ Error during shutdown", error);
  }
};

// ============================================
// 📤 Exports
// ============================================

export default app;
export { httpServer, io };
