/**
 * emailTemplates.js
 * Path: backend/templates/emailTemplates.js
 * Description: Base email templates and layout
 * Version: 2.0 - Fixed all exports
 * Changes:
 * - ✅ FIXED: All exports properly defined
 * - ✅ FIXED: Functions work correctly
 * - ✅ FIXED: RTL support
 */

// ============================================
// 🎨 Brand configuration
// ============================================

const BRAND = {
  name: "Learning Academy",
  nameFa: "آکادمی یادگیری",
  nameDe: "Lernakademie",
  primaryColor: "#4F46E5",
  primaryColorDark: "#4338CA",
  accentColor: "#F59E0B",
  backgroundColor: "#F9FAFB",
  textColor: "#111827",
  mutedColor: "#6B7280",
  borderColor: "#E5E7EB",
  successColor: "#22C55E",
  dangerColor: "#EF4444",
  logoUrl: "https://learning-academy.com/images/logo.svg",
  websiteUrl: "https://learning-academy.com",
  supportEmail: "support@learning-academy.com",
};

// ============================================
// 📦 Base Layout
// ============================================

export const baseLayout = (content, options = {}) => {
  const { title = BRAND.nameFa, language = "fa", dir = "rtl", previewText = "" } = options;

  return `
<!DOCTYPE html>
<html lang="${language}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'IRANSans', Tahoma, sans-serif;
      background-color: ${BRAND.backgroundColor};
      color: ${BRAND.textColor};
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 1px solid ${BRAND.borderColor};
    }
    .logo {
      max-height: 50px;
    }
    .content {
      background-color: #FFFFFF;
      padding: 40px 30px;
      border-radius: 12px;
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: ${BRAND.textColor};
      margin: 0 0 20px 0;
      text-align: center;
    }
    .text {
      font-size: 16px;
      color: ${BRAND.textColor};
      margin: 0 0 20px 0;
      line-height: 1.8;
    }
    .muted {
      color: ${BRAND.mutedColor};
      font-size: 14px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: ${BRAND.primaryColor};
      color: #FFFFFF !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      background-color: ${BRAND.primaryColorDark};
    }
    .alert {
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 14px;
    }
    .alert-warning {
      background-color: #FEF3C7;
      color: #92400E;
      border: 1px solid #FDE68A;
    }
    .alert-info {
      background-color: #DBEAFE;
      color: #1E40AF;
      border: 1px solid #93C5FD;
    }
    .footer {
      text-align: center;
      padding: 30px 0;
      color: ${BRAND.mutedColor};
      font-size: 13px;
    }
    .footer a {
      color: ${BRAND.primaryColor};
      text-decoration: none;
    }
    .divider {
      border: 0;
      border-top: 1px solid ${BRAND.borderColor};
      margin: 24px 0;
    }
    .code {
      font-family: 'Courier New', monospace;
      background-color: ${BRAND.backgroundColor};
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 18px;
      letter-spacing: 2px;
      text-align: center;
      margin: 20px 0;
      color: ${BRAND.primaryColor};
      font-weight: bold;
    }
    @media only screen and (max-width: 600px) {
      .container { padding: 10px; }
      .content { padding: 20px; }
      .title { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
  </div>

  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="${BRAND.logoUrl}" alt="${BRAND.name}" class="logo" />
    </div>

    <!-- Content -->
    <div class="content">
      ${content}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${BRAND.nameFa}. تمام حقوق محفوظ است.</p>
      <p>
        <a href="${BRAND.websiteUrl}">وب‌سایت</a> |
        <a href="mailto:${BRAND.supportEmail}">پشتیبانی</a> |
        <a href="${BRAND.websiteUrl}/unsubscribe">لغو اشتراک</a>
      </p>
      <p class="muted" style="margin-top: 16px; font-size: 12px;">
        این ایمیل به صورت خودکار ارسال شده است. لطفاً به آن پاسخ ندهید.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

// ============================================
// 🔘 Button Component
// ============================================

export const button = (text, url) => `
  <div style="text-align: center; margin: 24px 0;">
    <a href="${url}" class="button" target="_blank">${text}</a>
  </div>
`;

// ============================================
// 📝 Text Component
// ============================================

export const text = (content, options = {}) => {
  const { muted = false, bold = false, size = "normal" } = options;
  const classes = ["text"];
  if (muted) classes.push("muted");

  return `<p class="${classes.join(" ")}" style="${bold ? "font-weight: bold;" : ""} font-size: ${size === "small" ? "14px" : "16px"};">${content}</p>`;
};

// ============================================
// ⚠️ Alert Component
// ============================================

export const alert = (content, type = "info") => `
  <div class="alert alert-${type}">${content}</div>
`;

// ============================================
// 🔢 Code Component
// ============================================

export const code = (value) => `<div class="code">${value}</div>`;

// ============================================
// ➖ Divider
// ============================================

export const divider = () => `<hr class="divider" />`;

// ============================================
// 📦 Welcome Email Template
// ============================================

export const welcomeEmail = (data = {}) => {
  const { name = "کاربر گرامی", loginUrl = `${BRAND.websiteUrl}/login` } = data;

  const content = `
    <h1 class="title">خوش آمدید! 👋</h1>
    ${text(`سلام ${name}،`)}
    ${text("به آکادمی یادگیری خوش آمدید! ما هیجان‌زده‌ایم که در سفر یادگیری زبان آلمانی همراه شما باشیم.")}
    ${text("برای شروع، می‌توانید روی دکمه زیر کلیک کنید و اولین درس خود را آغاز کنید:")}
    ${button("شروع یادگیری", loginUrl)}
    ${divider()}
    ${text("اگر سؤالی دارید، می‌توانید با تیم پشتیبانی ما در تماس باشید.", { muted: true, size: "small" })}
  `;

  return {
    subject: `خوش آمدید به ${BRAND.nameFa}! 🎉`,
    html: baseLayout(content, { title: "خوش آمدید" }),
    text: `خوش آمدید به ${BRAND.nameFa}!

سلام ${name}،

به آکادمی یادگیری خوش آمدید! برای شروع یادگیری به ${loginUrl} بروید.

---
آکادمی یادگیری`,
  };
};

// ============================================
// 📤 Default Export
// ============================================

export default {
  baseLayout,
  button,
  text,
  alert,
  code,
  divider,
  welcomeEmail,
  BRAND,
};
