/**
 * resetPasswordEmail.js
 * Path: backend/templates/resetPasswordEmail.js
 * Description: Password reset email template
 * Version: 2.0 - Fixed imports and exports
 * Changes:
 * - ✅ FIXED: Import from emailTemplates.js correctly
 * - ✅ FIXED: export default function
 * - ✅ FIXED: Proper data structure
 */

import { baseLayout, button, text, alert, divider } from "./emailTemplates.js";

// ============================================
// 📨 Reset Password Email Template
// ============================================

export default function resetPasswordEmail(data = {}) {
  const {
    name = "کاربر گرامی",
    resetUrl = "",
    expirationMinutes = 60,
    ip = "",
    userAgent = "",
    supportUrl = "",
  } = data;

  const content = `
    <h1 class="title">بازیابی رمز عبور 🔐</h1>
    ${text(`سلام ${name}،`)}
    ${text("ما درخواستی برای بازنشانی رمز عبور حساب شما دریافت کردیم.")}

    ${button("بازنشانی رمز عبور", resetUrl)}

    ${alert(`این لینک تا ${expirationMinutes} دقیقه معتبر است. پس از این زمان، باید درخواست جدیدی ارسال کنید.`, "warning")}

    ${divider()}

    ${ip ? text(`اطلاعات درخواست:`, { muted: true, size: "small" }) : ""}
    ${ip ? text(`IP: ${ip}`, { muted: true, size: "small" }) : ""}
    ${userAgent ? text(`مرورگر: ${userAgent}`, { muted: true, size: "small" }) : ""}

    ${divider()}

    ${text("اگر شما این درخواست را ارسال نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید. رمز عبور شما تغییر نخواهد کرد.", { muted: true, size: "small" })}

    ${alert("برای امنیت بیشتر، پس از تغییر رمز عبور، در تمام دستگاه‌ها از حساب خارج خواهید شد.", "info")}

    ${
      supportUrl
        ? `<p style="text-align: center; margin-top: 20px;"><a href="${supportUrl}" style="color: #4F46E5; text-decoration: none; font-size: 14px;">نیاز به کمک دارید؟</a></p>`
        : ""
    }
  `;

  return {
    subject: "بازنشانی رمز عبور - آکادمی یادگیری",
    html: baseLayout(content, {
      title: "بازنشانی رمز عبور",
      previewText: "درخواست بازنشانی رمز عبور دریافت شد",
    }),
    text: `بازنشانی رمز عبور

سلام ${name}،

ما درخواست بازنشانی رمز عبور دریافت کردیم. برای ادامه روی لینک زیر کلیک کنید:
${resetUrl}

این لینک تا ${expirationMinutes} دقیقه معتبر است.

اگر شما این درخواست را ارسال نکرده‌اید، این ایمیل را نادیده بگیرید.

---
آکادمی یادگیری
${supportUrl || "https://learning-academy.com"}`,
  };
}
