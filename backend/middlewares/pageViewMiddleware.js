/**
 * pageViewMiddleware.js
 * German Academy — ردیابی تمام بازدیدهای صفحات
 */

import PageView from "../models/PageView.js";

const EXCLUDE_PATHS = [
  "/api/",
  "/socket.io/",
  "/favicon",
  "/robots.txt",
  "/manifest.json",
  "/.well-known/",
];

const detectDevice = (userAgent) => {
  if (!userAgent) return "other";
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod|blackberry|opera mini|iemobile/.test(ua)) {
    return /ipad|tablet/.test(ua) ? "tablet" : "mobile";
  }
  if (/tablet/.test(ua)) return "tablet";
  return "desktop";
};

const detectBrowser = (userAgent) => {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  if (/chrome|chromium|crios/.test(ua) && !/edg/.test(ua)) return "Chrome";
  if (/firefox|fxios/.test(ua)) return "Firefox";
  if (/safari/.test(ua) && !/chrome/.test(ua)) return "Safari";
  if (/edg/.test(ua)) return "Edge";
  if (/opera|opr/.test(ua)) return "Opera";
  return "Other";
};

export const trackPageView = async (req, res, next) => {
  if (req.method !== "GET") return next();

  const shouldExclude = EXCLUDE_PATHS.some((p) => req.path.startsWith(p));
  if (shouldExclude) return next();

  const startTime = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    if (res.statusCode >= 300 && res.statusCode < 400) return;

    setImmediate(async () => {
      try {
        await PageView.create({
          userId: req.user?.id || null,
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get("user-agent"),
          referer: req.get("referer"),
          device: detectDevice(req.get("user-agent")),
          browser: detectBrowser(req.get("user-agent")),
          sessionId: req.sessionID || null,
        });
      } catch (error) {
        // نادیده گرفته شود
      }
    });
  });

  next();
};

export default trackPageView;
