/**
 * replace-console-logs.js
 * Path: scripts/replace-console-logs.js
 * Description: Replace console.log with debug logger
 * Changes:
 * - L29: Automated replacement of console.log with debug
 * - FIXED: Replaced includes with string matching
 * - FIXED: Proper import path detection
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 🔧 Helper Functions
// ============================================

const shouldSkipFile = (filePath) => {
  const skipPatterns = [
    "node_modules",
    "dist",
    "build",
    ".test.",
    ".spec.",
    "debug.js",
  ];
  // ✅ FIXED: Using string patterns, not RegExp
  for (const pattern of skipPatterns) {
    if (filePath.includes(pattern)) {
      return true;
    }
  }
  return false;
};

const processFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Skip debug.js file itself
    if (filePath.includes("debug.js")) {
      return false;
    }

    // Check if file uses console.log
    if (
      !content.includes("console.log") &&
      !content.includes("console.info") &&
      !content.includes("console.warn") &&
      !content.includes("console.error")
    ) {
      return false;
    }

    // ✅ FIXED: Simple string replacement without RegExp
    const replacements = [
      { from: "console.log(", to: "debug.log(" },
      { from: "console.info(", to: "debug.info(" },
      { from: "console.warn(", to: "debug.warn(" },
      { from: "console.error(", to: "debug.error(" },
    ];

    for (const rep of replacements) {
      if (content.includes(rep.from)) {
        // Replace all occurrences
        while (content.includes(rep.from)) {
          content = content.replace(rep.from, rep.to);
          modified = true;
        }
      }
    }

    // ✅ FIXED: Add import if needed
    if (modified && !content.includes("import debug from")) {
      const lines = content.split("\n");

      // Find the best position to insert import
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("import ") || line.startsWith("//")) {
          insertIndex = i + 1;
        } else if (line && !line.startsWith("/*") && !line.startsWith("*")) {
          break;
        }
      }

      // Calculate correct import path
      const srcDir = path.join(__dirname, "../src");
      const relativeToSrc = path.relative(srcDir, filePath);
      const depthCount = relativeToSrc.split(path.sep).length - 1;

      let importPath;
      if (depthCount === 0) {
        importPath = "./utils/debug";
      } else {
        importPath = "../".repeat(depthCount) + "utils/debug";
      }

      // Normalize path separators
      importPath = importPath.replace(/\\/g, "/");

      lines.splice(insertIndex, 0, `import debug from "${importPath}";`);
      content = lines.join("\n");
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
};

const processDirectory = (dirPath) => {
  const items = fs.readdirSync(dirPath);
  let count = 0;

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item === "node_modules" || item === ".git") continue;
      count += processDirectory(fullPath);
    } else if (
      stat.isFile() &&
      (item.endsWith(".js") || item.endsWith(".jsx"))
    ) {
      if (!shouldSkipFile(fullPath)) {
        if (processFile(fullPath)) count++;
      }
    }
  }

  return count;
};

// ============================================
// 🚀 Main Execution
// ============================================

console.log("🔄 Replacing console.log with debug logger...\n");

// Process src directory
const srcPath = path.join(__dirname, "../src");
console.log(`📁 Processing src: ${srcPath}`);
let total = processDirectory(srcPath);

console.log(`\n✅ Updated ${total} files`);
console.log("✅ Console.log replacement complete!");
