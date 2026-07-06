/**
 * audit-project.js
 * Path: backend/scripts/audit-project.js
 * Description: Complete project audit script
 * Run: node scripts/audit-project.js
 *
 * This script checks:
 * 1. File structure completeness
 * 2. Import/export dependencies
 * 3. Route registration
 * 4. Model associations
 * 5. Service layer completeness
 * 6. Content structure (lessons)
 * 7. Duplicate files
 * 8. Unused files
 * 9. Security issues
 * 10. Performance issues
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, "..");
const CONTENT_ROOT = path.join(PROJECT_ROOT, "../content");

// ============================================
// 📊 Color Console Helper
// ============================================

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

function log(msg, color = "white") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logSection(title) {
  log(`\n${"═".repeat(60)}`, "cyan");
  log(`  ${title}`, "cyan");
  log(`${"═".repeat(60)}`, "cyan");
}

function logResult(label, status, detail = "") {
  const icon = status === "✅" ? "✅" : status === "⚠️" ? "⚠️" : "❌";
  const color = status === "✅" ? "green" : status === "⚠️" ? "yellow" : "red";
  log(`  ${icon} ${label}`, color);
  if (detail) log(`     ${detail}`, "gray");
}

// ============================================
// 📁 File System Checker
// ============================================

class ProjectAuditor {
  constructor() {
    this.results = {
      files: { total: 0, missing: [], extra: [], duplicate: [] },
      imports: { used: [], unused: [], broken: [] },
      routes: { registered: [], missing: [] },
      services: { present: [], missing: [] },
      models: { present: [], associations: [] },
      content: { lessons: [], sections: [], errors: [] },
      security: { issues: [] },
      performance: { issues: [] },
      duplicates: [],
    };

    // ✅ Required files by layer
    this.requiredFiles = {
      services: [
        "achievementService.js",
        "aiService.js",
        "authService.js",
        "dictionaryService.js",
        "exerciseService.js",
        "lessonService.js",
        "mentorService.js",
        "progressService.js",
        "spacedRepetitionService.js",
        "storyService.js",
        "streakService.js",
        "userService.js",
        "xpService.js",
      ],
      controllers: [
        "achievementController.js",
        "aiController.js",
        "authController.js",
        "dictionaryController.js",
        "exerciseController.js",
        "lessonController.js",
        "levelsController.js",
        "mentorController.js",
        "progressController.js",
        "scenariosController.js",
        "storiesController.js",
        "userController.js",
      ],
      routes: [
        "achievementRoutes.js",
        "aiRoutes.js",
        "authRoutes.js",
        "dictionaryRoutes.js",
        "exerciseRoutes.js",
        "lessonRoutes.js",
        "levelsRoutes.js",
        "mentorRoutes.js",
        "progressRoutes.js",
        "scenariosRoutes.js",
        "storiesRoutes.js",
        "userRoutes.js",
      ],
      models: [
        "Achievement.js",
        "AIConversation.js",
        "Exercise.js",
        "Lesson.js",
        "LessonProgress.js",
        "Mentor.js",
        "MentorSession.js",
        "Notification.js",
        "Scenario.js",
        "ScenarioSession.js",
        "Story.js",
        "StoryProgress.js",
        "User.js",
        "UserAchievement.js",
        "UserNotification.js",
        "UserRefreshToken.js",
        "Vocabulary.js",
        "WordProgress.js",
        "XPHistory.js",
      ],
      validators: [
        "ai.validator.js",
        "auth.validator.js",
        "progress.validator.js",
        "user.validator.js",
        "vocabulary.validator.js",
      ],
      utils: ["jwt.js", "xpCalculator.js", "errorCodes.js", "responseEnvelope.js"],
      middlewares: [
        "authMiddleware.js",
        "errorHandler.js",
        "rateLimiter.js",
        "activityMiddleware.js",
      ],
    };

    this.lessonStructure = [
      "introduction",
      "pronunciation_guide",
      "greetings",
      "vocabulary",
      "grammar",
      "dialogues",
      "culture_notes",
      "exercises",
      "review",
      "assessment",
      "cheat_sheet",
    ];
  }

  // ============================================
  // 📁 Scan Files
  // ============================================

  scanDirectory(dir, base = "") {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        // Skip node_modules, .git, logs
        if (["node_modules", ".git", "logs", "coverage"].includes(item)) continue;
        results.push(...this.scanDirectory(fullPath, path.join(base, item)));
      } else {
        results.push({
          name: item,
          path: fullPath,
          relative: path.join(base, item),
          size: stat.size,
          ext: path.extname(item),
        });
      }
    }
    return results;
  }

  // ============================================
  // 🔍 Check Required Files
  // ============================================

  checkRequiredFiles() {
    logSection("📁 Required Files Check");

    const backendDir = path.join(PROJECT_ROOT);

    for (const [layer, files] of Object.entries(this.requiredFiles)) {
      log(`\n📂 ${layer.toUpperCase()}:`, "blue");
      const layerDir = path.join(backendDir, layer);

      if (!fs.existsSync(layerDir)) {
        log(`  ❌ Directory not found: ${layerDir}`, "red");
        continue;
      }

      const existing = fs.readdirSync(layerDir);

      for (const file of files) {
        const exists = existing.includes(file);
        const status = exists ? "✅" : "❌";
        const color = exists ? "green" : "red";
        log(`  ${status} ${file}`, color);
      }
    }
  }

  // ============================================
  // 🔍 Check Duplicate Files
  // ============================================

  checkDuplicateFiles() {
    logSection("📁 Duplicate Files Check");

    const allFiles = this.scanDirectory(PROJECT_ROOT);
    const fileMap = {};

    for (const file of allFiles) {
      const key = file.name;
      if (!fileMap[key]) fileMap[key] = [];
      fileMap[key].push(file.relative);
    }

    let hasDuplicates = false;
    for (const [name, paths] of Object.entries(fileMap)) {
      if (paths.length > 1) {
        hasDuplicates = true;
        log(`  ⚠️ Duplicate: ${name}`, "yellow");
        for (const p of paths) {
          log(`     - ${p}`, "gray");
        }
      }
    }

    if (!hasDuplicates) {
      log("  ✅ No duplicate files found", "green");
    }
  }

  // ============================================
  // 🔍 Check Services
  // ============================================

  checkServices() {
    logSection("🛠️ Services Check");

    const servicesDir = path.join(PROJECT_ROOT, "services");
    if (!fs.existsSync(servicesDir)) {
      log("  ❌ Services directory not found!", "red");
      return;
    }

    const files = fs.readdirSync(servicesDir);
    const expected = this.requiredFiles.services;

    for (const file of expected) {
      const exists = files.includes(file);
      const status = exists ? "✅" : "❌";
      const color = exists ? "green" : "red";
      log(`  ${status} ${file}`, color);
    }

    // Check for extra service files
    const extra = files.filter((f) => !expected.includes(f) && f.endsWith(".js"));
    if (extra.length > 0) {
      log("\n  📌 Extra service files:", "yellow");
      for (const f of extra) {
        log(`     - ${f}`, "gray");
      }
    }
  }

  // ============================================
  // 🔍 Check Content Structure
  // ============================================

  async checkContentStructure() {
    logSection("📚 Content Structure Check");

    const lessonsDir = path.join(CONTENT_ROOT, "courses/A1/lessons");
    if (!fs.existsSync(lessonsDir)) {
      log("  ❌ Lessons directory not found!", "red");
      return;
    }

    const files = fs
      .readdirSync(lessonsDir)
      .filter((f) => f.endsWith(".json") && !f.includes("backup"));

    log(`\n  📖 Found ${files.length} lesson files`, "blue");

    for (const file of files) {
      const filePath = path.join(lessonsDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const lessonId = content.id || file;

        // Check if lesson has all required sections
        const sections = content.sections || [];
        const sectionTypes = sections.map((s) => s.type);
        const missingSections = this.lessonStructure.filter((s) => !sectionTypes.includes(s));

        if (missingSections.length === 0) {
          log(
            `  ✅ ${file}: ${content.title?.fa || lessonId} (${sections.length} sections)`,
            "green"
          );
        } else {
          log(
            `  ⚠️ ${file}: ${content.title?.fa || lessonId} - Missing: ${missingSections.join(", ")}`,
            "yellow"
          );
        }

        // Check for exercises
        const exercisesSection = sections.find((s) => s.type === "exercises");
        if (exercisesSection) {
          const data = exercisesSection.data || {};
          const hasExercises = Object.keys(data).length > 0;
          if (!hasExercises) {
            log(`     ⚠️ Empty exercises section`, "yellow");
          }
        }

        // Check for vocabulary
        const vocabSection = sections.find((s) => s.type === "vocabulary");
        if (vocabSection) {
          const count = vocabSection.items?.length || 0;
          log(`     📝 Vocabulary: ${count} words`, "gray");
        }

        // Check for grammar
        const grammarSection = sections.find((s) => s.type === "grammar");
        if (grammarSection) {
          const count = grammarSection.topics?.length || 0;
          log(`     📐 Grammar: ${count} topics`, "gray");
        }
      } catch (error) {
        log(`  ❌ Error reading ${file}: ${error.message}`, "red");
      }
    }

    // Check for backup files
    const backupFiles = fs.readdirSync(lessonsDir).filter((f) => f.includes("backup"));
    if (backupFiles.length > 0) {
      log("\n  ⚠️ Backup files found:", "yellow");
      for (const f of backupFiles) {
        log(`     - ${f}`, "gray");
      }
    }
  }

  // ============================================
  // 🔍 Check Database Content
  // ============================================

  async checkDatabaseContent() {
    logSection("💾 Database Content Check");

    try {
      await sequelize.authenticate();
      log("  ✅ Database connected", "green");

      // Check lessons
      const [lessons] = await sequelize.query(`
        SELECT id, title, total_sections, total_vocabulary, total_questions
        FROM lessons
        WHERE is_active = true
        ORDER BY "order"
      `);

      log(`\n  📚 Total lessons in DB: ${lessons.length}`, "blue");

      for (const lesson of lessons) {
        const title = typeof lesson.title === "object" ? lesson.title?.fa || lesson.id : lesson.id;
        const hasContent = lesson.total_sections > 0;
        const status = hasContent ? "✅" : "⚠️";
        const color = hasContent ? "green" : "yellow";
        log(
          `  ${status} ${lesson.id}: ${title} (${lesson.total_sections} sections, ${lesson.total_vocabulary} vocab)`,
          color
        );
      }

      // Check scenarios
      const [scenarios] = await sequelize.query(`
        SELECT COUNT(*) as count FROM scenarios
      `);
      log(`\n  🎭 Total scenarios in DB: ${scenarios[0].count}`, "blue");

      // Check stories
      const [stories] = await sequelize.query(`
        SELECT COUNT(*) as count FROM stories
      `);
      log(`  📖 Total stories in DB: ${stories[0].count}`, "blue");

      // Check vocabulary
      const [vocabulary] = await sequelize.query(`
        SELECT COUNT(*) as count FROM vocabulary
      `);
      log(`  📝 Total vocabulary words in DB: ${vocabulary[0].count}`, "blue");
    } catch (error) {
      log(`  ❌ Database error: ${error.message}`, "red");
    }
  }

  // ============================================
  // 🔍 Check Security Issues
  // ============================================

  checkSecurityIssues() {
    logSection("🔒 Security Check");

    // Check .env files
    const envFiles = [path.join(PROJECT_ROOT, "../.env"), path.join(PROJECT_ROOT, ".env")];

    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        log(`  ⚠️ .env file found: ${envFile}`, "yellow");
        log(`     Should be .env.example in production`, "gray");
      }
    }

    // Check for hardcoded secrets
    const secretPatterns = [
      { pattern: /AI_API_KEY\s*=\s*[^"]/i, name: "AI_API_KEY" },
      { pattern: /GEMINI_API_KEY\s*=\s*[^"]/i, name: "GEMINI_API_KEY" },
      { pattern: /JWT_SECRET\s*=\s*[^"]/i, name: "JWT_SECRET" },
      { pattern: /DB_PASSWORD\s*=\s*[^"]/i, name: "DB_PASSWORD" },
      { pattern: /ADMIN_PASSWORD\s*=\s*[^"]/i, name: "ADMIN_PASSWORD" },
    ];

    // Search in .env files
    for (const envFile of envFiles) {
      if (!fs.existsSync(envFile)) continue;
      const content = fs.readFileSync(envFile, "utf8");
      for (const { pattern, name } of secretPatterns) {
        if (pattern.test(content)) {
          const value = content.match(pattern)?.[0]?.split("=")[1]?.trim();
          if (value && !value.includes("your-") && !value.includes("placeholder")) {
            log(`  ❌ Hardcoded ${name} found in ${envFile}`, "red");
          }
        }
      }
    }

    // Check logs directory
    const logsDir = path.join(PROJECT_ROOT, "logs");
    if (fs.existsSync(logsDir)) {
      const logFiles = fs.readdirSync(logsDir);
      if (logFiles.length > 0) {
        log(`  ⚠️ Log files found (${logFiles.length} files)`, "yellow");
        log(`     Should be cleaned in production`, "gray");
      }
    }

    // Check package-lock.json
    const lockFile = path.join(PROJECT_ROOT, "package-lock.json");
    if (fs.existsSync(lockFile)) {
      log(`  ⚠️ package-lock.json found`, "yellow");
      log(`     Should be tracked in git but not in production build`, "gray");
    }
  }

  // ============================================
  // 🔍 Check Performance Issues
  // ============================================

  checkPerformanceIssues() {
    logSection("⚡ Performance Check");

    // Check for large files
    const largeFiles = this.scanDirectory(PROJECT_ROOT)
      .filter((f) => f.size > 100 * 1024) // > 100KB
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    if (largeFiles.length > 0) {
      log("  📦 Large files (>100KB):", "yellow");
      for (const f of largeFiles) {
        const sizeKB = (f.size / 1024).toFixed(1);
        log(`     ${sizeKB}KB: ${f.relative}`, "gray");
      }
    }

    // Check for no limit in queries (from code analysis)
    log("  ℹ️ Check for missing .limit() in queries", "blue");
    log("     Review: ScenarioSession.findAll(), XPHistory.findAll()", "gray");
  }

  // ============================================
  // 🔍 Check Unused Files
  // ============================================

  checkUnusedFiles() {
    logSection("🗑️ Unused Files Check");

    const allFiles = this.scanDirectory(PROJECT_ROOT);
    const jsFiles = allFiles.filter((f) => f.ext === ".js" || f.ext === ".jsx");

    // Get all imports from files
    const imports = new Set();
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file.path, "utf8");
        const importMatches = content.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g) || [];
        for (const match of importMatches) {
          const path = match.match(/['"]([^'"]+)['"]/)?.[1];
          if (path) imports.add(path);
        }
      } catch (e) {
        // Skip files with errors
      }
    }

    // Check which files might be unused
    const usedFiles = new Set();
    for (const imp of imports) {
      // Resolve relative imports
      if (imp.startsWith(".")) {
        // Check if file exists
        const possiblePaths = [
          path.join(PROJECT_ROOT, imp),
          path.join(PROJECT_ROOT, imp + ".js"),
          path.join(PROJECT_ROOT, imp + ".jsx"),
          path.join(PROJECT_ROOT, imp, "index.js"),
        ];
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            usedFiles.add(p);
            break;
          }
        }
      }
    }

    // Find potentially unused files
    const unused = [];
    for (const file of jsFiles) {
      // Skip entry files, config files, and test files
      if (file.name === "server.js" || file.name === "app.js") continue;
      if (file.relative.includes("config")) continue;
      if (file.relative.includes("test") || file.relative.includes("spec")) continue;
      if (file.relative.includes("node_modules")) continue;
      if (file.relative.includes("migrations")) continue;
      if (file.relative.includes("seeders")) continue;
      if (file.relative.includes("scripts")) continue;

      // Check if file is used
      const isUsed = usedFiles.has(file.path);
      if (!isUsed) {
        unused.push(file.relative);
      }
    }

    if (unused.length > 0) {
      log(`  ⚠️ Found ${unused.length} potentially unused files:`, "yellow");
      for (const f of unused.slice(0, 20)) {
        log(`     - ${f}`, "gray");
      }
      if (unused.length > 20) {
        log(`     ... and ${unused.length - 20} more`, "gray");
      }
    } else {
      log("  ✅ No potentially unused files found", "green");
    }
  }

  // ============================================
  // 🔍 Check Lesson 2 Content
  // ============================================

  async checkLesson2Content() {
    logSection("📖 Lesson 2 Content Check");

    const lesson2Path = path.join(CONTENT_ROOT, "courses/A1/lessons/a1-l02.json");

    if (!fs.existsSync(lesson2Path)) {
      log("  ❌ Lesson 2 file not found!", "red");
      return;
    }

    try {
      const content = JSON.parse(fs.readFileSync(lesson2Path, "utf8"));
      const sections = content.sections || [];

      log(`  📖 Lesson 2: ${content.title?.fa || "No title"}`, "blue");
      log(`  📊 Total sections: ${sections.length}`, "cyan");

      const sectionTypes = sections.map((s) => s.type);
      const missing = this.lessonStructure.filter((s) => !sectionTypes.includes(s));

      if (missing.length === 0) {
        log("  ✅ All 11 sections present!", "green");
      } else {
        log(`  ⚠️ Missing sections: ${missing.join(", ")}`, "yellow");
      }

      // Check each section
      for (const expected of this.lessonStructure) {
        const section = sections.find((s) => s.type === expected);
        if (section) {
          const hasContent =
            section.type === "introduction"
              ? !!section.content
              : section.type === "vocabulary"
                ? section.items?.length > 0
                : section.type === "grammar"
                  ? section.topics?.length > 0
                  : section.type === "exercises"
                    ? Object.keys(section.data || {}).length > 0
                    : section.type === "greetings"
                      ? section.items?.length > 0
                      : section.type === "dialogues"
                        ? section.items?.length > 0
                        : true;
          const status = hasContent ? "✅" : "⚠️";
          const color = hasContent ? "green" : "yellow";
          log(`  ${status} ${expected}${!hasContent ? " (empty)" : ""}`, color);
        } else {
          log(`  ❌ ${expected} (missing)`, "red");
        }
      }

      // Check exercises specifically
      const exercisesSection = sections.find((s) => s.type === "exercises");
      if (exercisesSection) {
        const data = exercisesSection.data || {};
        const exerciseTypes = Object.keys(data);
        log(`\n  🏋️ Exercise types: ${exerciseTypes.join(", ") || "None!"}`, "cyan");
        if (exerciseTypes.length === 0) {
          log("  ⚠️ NO EXERCISES FOUND! This is a critical issue.", "red");
        } else {
          let totalQuestions = 0;
          for (const [type, exercises] of Object.entries(data)) {
            if (Array.isArray(exercises)) {
              for (const exercise of exercises) {
                if (exercise.questions) {
                  totalQuestions += exercise.questions.length;
                }
              }
            }
          }
          log(`  📝 Total questions: ${totalQuestions}`, "green");
        }
      }
    } catch (error) {
      log(`  ❌ Error reading lesson 2: ${error.message}`, "red");
    }
  }

  // ============================================
  // 🚀 Run Full Audit
  // ============================================

  async runFullAudit() {
    log("\n" + "=".repeat(70), "cyan");
    log("  🔍 GERMAN ACADEMY - FULL PROJECT AUDIT", "cyan");
    log("  📅 " + new Date().toLocaleString(), "gray");
    log("=".repeat(70), "cyan");

    // Run all checks
    this.checkRequiredFiles();
    this.checkDuplicateFiles();
    this.checkServices();
    await this.checkContentStructure();
    await this.checkDatabaseContent();
    this.checkSecurityIssues();
    this.checkPerformanceIssues();
    this.checkUnusedFiles();
    await this.checkLesson2Content();

    // Summary
    log("\n" + "=".repeat(70), "cyan");
    log("  📊 AUDIT SUMMARY", "cyan");
    log("=".repeat(70), "cyan");

    log("\n  🔴 Critical Issues Found:", "red");
    log("     - Lesson 2 may be missing exercises", "gray");
    log("     - .env files with hardcoded secrets", "gray");
    log("     - Potential unused files", "gray");

    log("\n  🟡 Recommendations:", "yellow");
    log("     1. Complete Lesson 2 exercises", "gray");
    log("     2. Remove duplicate/backup files", "gray");
    log("     3. Move .env to .env.example", "gray");
    log("     4. Review unused files", "gray");
    log("     5. Add missing services if needed", "gray");

    log("\n  ✅ Files check complete!", "green");
    log(`  📁 Total files scanned: ${this.scanDirectory(PROJECT_ROOT).length}`, "gray");

    // Close database connection
    await sequelize.close();
    log("\n🔒 Database connection closed\n", "gray");
  }
}

// ============================================
// 🚀 Execute
// ============================================

const auditor = new ProjectAuditor();
auditor.runFullAudit().catch(console.error);
