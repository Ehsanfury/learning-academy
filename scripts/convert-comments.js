/**
 * convert-comments.js
 * Path: scripts/convert-comments.js
 * Description: Convert Persian comments to English in backend files
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 📚 Persian to English Comment Mapping
// ============================================

const COMMENT_MAP = {
  // Common comments
  "فایل اصلی Express Application": "Main Express Application file",
  "ورودی اصلی برنامه": "Main application entry point",
  "مدیریت متغیرهای محیطی": "Environment variables management",
  "مدیریت مرکزی مدل‌ها و Associations":
    "Central model and associations management",
  "مدیریت توکن‌های JWT": "JWT token management",
  "کدهای خطای یکپارچه": "Unified error codes",
  "محاسبات مربوط به XP و Level": "XP and Level calculations",
  "مدیریت اتصالات WebSocket برای ارتباط زنده":
    "WebSocket connection management for real-time communication",
  "کنترلر مدیریت دستاوردها": "Achievements controller",
  "کنترلر مدیریت هوش مصنوعی": "AI controller",
  "سرویس مدیریت گل‌زنی": "Streak management service",
  "سرویس مدیریت منتورها و جلسات آموزشی":
    "Mentor and session management service",
  "مدل دستاوردها": "Achievements model",
  "مدل ارتباط کاربر و دستاوردها": "User-Achievement relation model",
  "مدل مکالمات با هوش مصنوعی": "AI Conversations model",
  "مدل دیکشنری و کلمات": "Dictionary and words model",
  "مدل پیشرفت کاربر در هر درس": "User lesson progress model",
  "مدل جلسات منتورینگ": "Mentoring sessions model",
  "مدل نوتیفیکیشن‌ها و تبلیغات": "Notifications and promotions model",
  "مدل پیشرفت کلمات با الگوریتم SM-2":
    "Word progress model with SM-2 algorithm",
  "مسیرهای مدیریت دستاوردها": "Achievements routes",
  "مسیرهای هوش مصنوعی": "AI routes",
  "مسیرهای مربوط به دیکشنری": "Dictionary routes",
  "مسیرهای مدیریت دروس": "Lessons routes",
  "مسیرهای مدیریت پیشرفت کاربر": "User progress routes",
  "مسیرهای مدیریت منتورها": "Mentors routes",
  "مسیرهای مربوط به کاربر": "User routes",
  "مسیرهای مربوط به واژگان": "Vocabulary routes",
  "سرویس مدیریت منتورها": "Mentor management service",
  "سرویس هوش مصنوعی": "AI service",
  "سرویس مدیریت پیشرفت": "Progress management service",

  // Controller comments
  "دریافت همه دستاوردها با وضعیت دریافت برای کاربر":
    "Get all achievements with status for user",
  "دریافت دستاوردهای کسب شده توسط کاربر": "Get user earned achievements",
  "دریافت دستاوردهای جدید (دیده نشده)": "Get unviewed achievements",
  "علامت‌گذاری دستاورد به عنوان دیده شده": "Mark achievement as viewed",
  "دریافت آمار دستاوردهای کاربر": "Get user achievement statistics",
  "چت با هوش مصنوعی (عمومی)": "Chat with AI (public)",
  "تصحیح گرامر": "Grammar correction",
  "ترجمه به آلمانی": "Translate to German",
  "توضیح گرامر": "Grammar explanation",
  "تولید تمرین": "Generate exercise",
  "شروع سناریو": "Start scenario",
  "ادامه سناریو": "Continue scenario",
  "دریافت تاریخچه مکالمات": "Get conversation history",
  "پاک کردن تاریخچه مکالمات": "Clear conversation history",
  "دریافت لیست جلسات": "Get sessions list",
  "جستجوی کلمات": "Search words",
  "دریافت جزئیات یک کلمه": "Get word details",
  "ذخیره کلمه در لیست کاربر": "Save word to user list",
  "حذف کلمه از لیست کاربر": "Remove word from user list",
  "دریافت کلمات ذخیره شده کاربر": "Get user saved words",
  "دریافت دسته‌بندی‌های دیکشنری": "Get dictionary categories",
  "ثبت‌نام به عنوان منتور": "Register as mentor",
  "دریافت لیست منتورها": "Get mentors list",
  "دریافت جزئیات یک منتور": "Get mentor details",
  "دریافت پروفایل منتور کاربر جاری": "Get current user mentor profile",
  "رزرو جلسه با منتور": "Book session with mentor",
  "دریافت جلسات من": "Get my sessions",
  "تایید یا لغو جلسه (برای منتور)": "Approve or cancel session (for mentor)",
  "تکمیل جلسه و ثبت بازخورد": "Complete session and submit feedback",
  "دریافت آمار منتور": "Get mentor statistics",
  "به‌روزرسانی پروفایل منتور": "Update mentor profile",
  "دریافت لیست لغات": "Get words list",
  "دریافت لغت با آیدی": "Get word by ID",
  "جستجوی کلمات در دیکشنری": "Search words in dictionary",
  "دریافت دسته‌بندی‌های لغات": "Get vocabulary categories",
  "ذخیره لغت در لیست کاربر": "Save word to user list",
  "حذف لغت از لیست کاربر": "Remove word from user list",
  "دریافت لغات ذخیره شده کاربر": "Get user saved words",
  "مرور لغت": "Review word",
  "دریافت فعالیت‌های کاربر": "Get user activities",

  // Model comments
  "اطلاعات اصلی": "Main information",
  "نقش کاربر": "User role",
  پروفایل: "Profile",
  گیمیفیکیشن: "Gamification",
  تنظیمات: "Settings",
  "وضعیت اکانت": "Account status",
  متادیتا: "Metadata",
  "زمان دریافت دستاورد": "Achievement earned time",
  "آیا کاربر این دستاورد رو دیده؟": "Has user viewed this achievement?",

  // Middleware comments
  "Middleware برای ثبت فعالیت‌های کاربر و به‌روزرسانی گل‌زنی":
    "User activity tracking and streak update middleware",
  "Middleware ثبت فعالیت کاربر": "User activity tracking middleware",
  "Middleware ثبت لاگین": "Login tracking middleware",
  "Middleware برای احراز هویت": "Authentication middleware",
  "Middleware احراز هویت اجباری": "Required authentication middleware",
  "Middleware احراز هویت اختیاری": "Optional authentication middleware",
  "Middleware بررسی نقش کاربر": "User role check middleware",
  "Middleware بررسی تایید ایمیل": "Email verification check middleware",
  "محدودیت تعداد درخواست‌ها برای جلوگیری از حملات Brute Force":
    "Rate limiting to prevent brute force attacks",
  "محدودیت عمومی برای همه‌ی مسیرهای /api": "General limit for all /api routes",
  "محدودیت سخت‌گیرانه برای مسیرهای احراز هویت":
    "Strict limit for authentication routes",
  "محدودیت سخت‌گیرانه‌تر برای ثبت‌نام": "Stricter limit for registration",
  "محدودیت برای مسیرهای AI": "Limit for AI routes",

  // Error comments
  "برای stack trace بهتر": "For better stack trace",
  "تبدیل خطا به JSON برای پاسخ API": "Convert error to JSON for API response",
  "آیا این خطا باید به کاربر نمایش داده شود؟":
    "Should this error be shown to user?",
  "آیا این خطا باید لاگ شود؟": "Should this error be logged?",
  "ایجاد ValidationError از خطاهای Joi/Zod":
    "Create ValidationError from Joi/Zod errors",
  "ایجاد ValidationError برای یک فیلد خاص":
    "Create ValidationError for a specific field",
  "ایجاد ConflictError برای ایمیل تکراری":
    "Create ConflictError for duplicate email",
  "ایجاد ConflictError برای نام کاربری تکراری":
    "Create ConflictError for duplicate username",
  "ایجاد ForbiddenError برای نقش ناکافی":
    "Create ForbiddenError for insufficient role",
  "ایجاد ForbiddenError برای مالکیت": "Create ForbiddenError for ownership",
  "ایجاد NotFoundError برای یک مدل خاص":
    "Create NotFoundError for a specific model",
  "ایجاد NotFoundError برای یک درس": "Create NotFoundError for a lesson",
  "ایجاد NotFoundError برای یک کاربر": "Create NotFoundError for a user",
  "ایجاد UnauthorizedError برای توکن منقضی شده":
    "Create UnauthorizedError for expired token",
  "ایجاد UnauthorizedError برای توکن نامعتبر":
    "Create UnauthorizedError for invalid token",
  "ایجاد UnauthorizedError برای عدم وجود توکن":
    "Create UnauthorizedError for missing token",
};

// ============================================
// 🔧 Helper Functions
// ============================================

const isPersian = (text) => {
  return /[\u0600-\u06FF]/.test(text);
};

const translateComment = (text) => {
  // Remove comment markers
  const cleaned = text
    .replace(/^\/\/\s*/, "")
    .replace(/^\/\*/, "")
    .replace(/\*\/$/, "")
    .trim();

  // Check if it's Persian
  if (!isPersian(cleaned)) return text;

  // Try to find translation
  for (const [persian, english] of Object.entries(COMMENT_MAP)) {
    if (cleaned.includes(persian) || persian.includes(cleaned)) {
      // Replace only the Persian part
      return text.replace(cleaned, english);
    }
  }

  // If no translation found, add TODO marker
  return `// TODO: Translate - ${cleaned}`;
};

const processFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let modified = false;

    const newLines = lines.map((line) => {
      // Check if line contains Persian characters
      if (isPersian(line)) {
        // Check if it's a comment line
        if (line.includes("//") || line.includes("/*") || line.includes("*")) {
          modified = true;
          return translateComment(line);
        }
      }
      return line;
    });

    if (modified) {
      fs.writeFileSync(filePath, newLines.join("\n"), "utf8");
      console.log(`✅ Converted: ${filePath}`);
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
      // Skip node_modules
      if (item === "node_modules") continue;
      count += processDirectory(fullPath);
    } else if (
      stat.isFile() &&
      (item.endsWith(".js") || item.endsWith(".jsx"))
    ) {
      // Skip test files and config files if needed
      if (item.includes(".test.") || item.includes(".spec.")) continue;
      if (processFile(fullPath)) count++;
    }
  }

  return count;
};

// ============================================
// 🚀 Main Execution
// ============================================

console.log("🔄 Converting Persian comments to English...\n");

// Process backend
const backendPath = path.join(__dirname, "../backend");
console.log(`📁 Processing backend: ${backendPath}`);
let total = processDirectory(backendPath);

console.log(`\n✅ Converted ${total} files`);

// Process frontend if needed
// const frontendPath = path.join(__dirname, '../src');
// console.log(`\n📁 Processing frontend: ${frontendPath}`);
// total += processDirectory(frontendPath);

console.log(`\n✅ Total files converted: ${total}`);
