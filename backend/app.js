/**
 * app.js
 * Learning Academy
 * فایل اصلی Express Application
 * Changes:
 * - ✅ FIXED: responseEnvelope temporarily disabled
 * - ✅ Added trackActivity middleware correctly
 * - ✅ Fixed middleware ordering
 * - ✅ Added Socket.IO setup
 * - ✅ Fixed production readiness checks
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

// Config
import sequelize, { testConnection } from "./config/db.js";
import config, { isAIConfigured, isGeminiConfigured } from "./config/env.js";
import { logInfo, logError } from "./config/logger.js";

// Middlewares
import rateLimiter from "./middlewares/rateLimiter.js";
import { trackActivity } from "./middlewares/activityMiddleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { authenticate } from "./middlewares/authMiddleware.js";
// import responseEnvelope from "./middlewares/responseEnvelope.js"; // موقتاً غیرفعال

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
import levelsRoutes from "./routes/levelsRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import storiesRoutes from "./routes/storiesRoutes.js";
import scenariosRoutes from "./routes/scenariosRoutes.js";

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
} from "./models/index.js";

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
      console.error("   Please set a secure JWT_SECRET in your .env file.");
      process.exit(1);
    }

    if (isPlaceholder(jwtRefreshSecret)) {
      console.error(
        "❌ Fatal: JWT_REFRESH_SECRET is using a placeholder/development value in production!"
      );
      console.error("   Please set a secure JWT_REFRESH_SECRET in your .env file.");
      process.exit(1);
    }

    if (config.db?.password === "123456") {
      console.error("❌ Fatal: DB_PASSWORD is using default '123456' in production!");
      console.error("   Please set a secure DB_PASSWORD in your .env file.");
      process.exit(1);
    }

    if (config.admin?.password === "admin123456" || !config.admin?.password) {
      console.error("❌ Fatal: ADMIN_PASSWORD is using default or not set in production!");
      console.error("   Please set a secure ADMIN_PASSWORD in your .env file.");
      process.exit(1);
    }

    if (!isAIConfigured()) {
      console.warn("⚠️ Warning: AI_API_KEY (OpenRouter) is not configured in production.");
    }

    if (!isGeminiConfigured()) {
      console.warn("⚠️ Warning: AI_API_KEY_GEMINI (Gemini) is not configured in production.");
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
    origin: config.cors?.origin?.split(",") || ["http://localhost:3000"],
    credentials: true,
  },
});

setupSocket(io);

// ============================================
// 🛡️ Middlewares
// ============================================

app.use(helmet());

const corsOrigins = config.cors?.origin ? config.cors.origin.split(",") : ["http://localhost:3000"];
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

app.use("/api", rateLimiter);

// ============================================
// 🏥 Health Check
// ============================================

app.get("/health", async (req, res) => {
  try {
    const isConnected = await testConnection();

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
      error: error.message,
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
    },
    documentation: "/api/docs",
  });
});

app.use("/api/auth", authRoutes);

// ============================================
// 🔐 PROTECTED ROUTES
// ============================================

app.use(authenticate);
app.use(trackActivity);

// ✅ responseEnvelope موقتاً غیرفعال شد
// app.use(responseEnvelope);

app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dictionary", dictionaryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/review", spacedRepetitionRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/levels", levelsRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/scenarios", scenariosRoutes);

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

    if (config.isDevelopment) {
      await sequelize.sync({ alter: false });
      logInfo("✅ Database synced successfully (development mode)");
    } else {
      logInfo("✅ Database connection verified (production mode)");
      logInfo("ℹ️ Schema changes should be applied via migrations in production");
    }

    const adminEmail = config.admin?.email || "admin@german-academy.com";
    const adminExists = await User.findOne({
      where: { email: adminEmail },
    });

    if (!adminExists) {
      const adminPassword = config.admin?.password;
      if (!adminPassword) {
        logInfo("⚠️ ADMIN_PASSWORD is not set in .env — Admin user creation skipped.");
      } else if (config.isDevelopment || !adminPassword.includes("admin")) {
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

process.on("SIGTERM", async () => {
  logInfo("🛑 SIGTERM received");
  await shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logInfo("🛑 SIGINT received");
  await shutdown();
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  logError("❌ Uncaught Exception:", error);
  shutdown().then(() => {
    process.exit(1);
  });
});

process.on("unhandledRejection", (reason, promise) => {
  logError("❌ Unhandled Rejection:", reason);
  shutdown().then(() => {
    process.exit(1);
  });
});

// ============================================
// 📤 Exports
// ============================================

export default app;
export { httpServer, io };
