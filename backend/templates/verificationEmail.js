/**
 * verificationEmail.js
 * Path: backend/templates/verificationEmail.js
 * Description: Email verification template
 * Version: 2.0 - Fixed imports and exports
 * Changes:
 * - ✅ FIXED: Import from emailTemplates.js correctly
 * - ✅ FIXED: export default function
 * - ✅ FIXED: Proper data structure
 */

import { baseLayout, button, text, alert, code, divider } from "./emailTemplates.js";

// ============================================
// 📨 Verification Email Template
// ============================================

export default function verificationEmail(data = {}) {
  const {
    name = "کاربر گرامی",
    verificationUrl = "",
    verificationCode = "",
    expirationHours = 24,
    supportUrl = "",
  } = data;

  const content = `
    <h1 class="title">تأیید ایمیل 📧</h1>
    ${text(`سلام ${name}،`)}
    ${text("برای تکمیل ثبت‌نام و فعال‌سازی حساب کاربری خود، لطفاً ایمیل خود را تأیید کنید.")}

    ${verificationUrl ? button("تأیید ایمیل", verificationUrl) : ""}

    ${
      verificationCode
        ? `${text("یا می‌توانید از کد زیر استفاده کنید:", { muted: true })}
           ${code(verificationCode)}
           ${alert(`این کد تا ${expirationHours} ساعت معتبر است.`, "warning")}`
        : ""
    }

    ${divider()}

    ${text("اگر شما این درخواست را ارسال نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید یا با پشتیبانی در تماس باشید.", { muted: true, size: "small" })}

    ${
      supportUrl
        ? `<p style="text-align: center; margin-top: 20px;"><a href="${supportUrl}" style="color: #4F46E5; text-decoration: none; font-size: 14px;">نیاز به کمک دارید؟</a></p>`
        : ""
    }
  `;

  return {
    subject: "تأیید ایمیل - آکادمی یادگیری",
    html: baseLayout(content, {
      title: "تأیید ایمیل",
      previewText: "لطفاً ایمیل خود را تأیید کنید تا ثبت‌نام شما تکمیل شود",
    }),
    text: `تأیید ایمیل

سلام ${name}،

برای تکمیل ثبت‌نام، ایمیل خود را با کلیک روی لینک زیر تأیید کنید:
${verificationUrl}

یا از این کد استفاده کنید: ${verificationCode}

این کد تا ${expirationHours} ساعت معتبر است.

اگر شما این درخواست را ارسال نکرده‌اید، این ایمیل را نادیده بگیرید.

---
آکادمی یادگیری
${supportUrl || "https://learning-academy.com"}`,
  };
}
