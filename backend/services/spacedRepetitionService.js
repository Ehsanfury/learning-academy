/**
 * spacedRepetitionService.js
 * German Academy
 * SM-2 Algorithm Service
 * Changes:
 * - M2: Consolidated SM-2 logic (single source of truth)
 * - Removed duplicate SM-2 logic from vocabularyController
 * - Now used by both spaced repetition and vocabulary review
 */

import { Op } from "sequelize";
import WordProgress from "../models/WordProgress.js";

class SpacedRepetitionService {
  /**
   * ✅ M2: Single source of truth for SM-2 algorithm
// TODO: Translate - TODO: Translate - * محاسبه پارامترهای جدید SM-2 بر اساس کیفیت پاسخ
   */
  calculateSM2(progress, quality) {
    let { easeFactor, interval, repetitions } = progress;

// TODO: Translate - TODO: Translate - // اگر کیفیت کمتر از ۳ باشه، کلمه رو دوباره از اول شروع میکنیم
    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      repetitions += 1;

// TODO: Translate - TODO: Translate - // تعیین فاصله بر اساس تعداد تکرارها
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

// TODO: Translate - TODO: Translate - // محاسبه فاکتور آسانی (Ease Factor)
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

// TODO: Translate - TODO: Translate - // محدود کردن فاکتور آسانی به حداقل ۱.۳
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }

// TODO: Translate - TODO: Translate - // محاسبه تاریخ مرور بعدی
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      repetitions,
      interval,
      easeFactor,
      nextReviewDate,
      lastQuality: quality,
    };
  }

  /**
// TODO: Translate - TODO: Translate - * مرور یک کلمه با کیفیت داده شده
   * ✅ M2: Uses consolidated SM-2 logic
   */
  async reviewWord(userId, wordId, quality) {
    if (quality < 0 || quality > 5) {
      throw new Error("Quality must be between 0 and 5");
    }

// TODO: Translate - TODO: Translate - // پیدا کردن یا ایجاد پیشرفت کلمه
    let progress = await WordProgress.findOne({
      where: {
        userId,
        wordId,
      },
    });

    if (!progress) {
      progress = await WordProgress.create({
        userId,
        wordId,
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
      });
    }

    // ✅ M2: Use consolidated SM-2 calculation
    const updated = this.calculateSM2(progress, quality);

// TODO: Translate - TODO: Translate - // به‌روزرسانی پیشرفت
    await progress.update({
      easeFactor: updated.easeFactor,
      interval: updated.interval,
      repetitions: updated.repetitions,
      lastQuality: updated.lastQuality,
      lastReviewDate: new Date(),
      nextReviewDate: updated.nextReviewDate,
    });

    return progress;
  }

  /**
// TODO: Translate - TODO: Translate - * دریافت کلماتی که زمان مرورشان رسیده
   */
  async getDueWords(userId) {
    return await WordProgress.findAll({
      where: {
        userId,
        nextReviewDate: {
          [Op.lte]: new Date(),
        },
      },
      order: [["nextReviewDate", "ASC"]],
    });
  }

  /**
// TODO: Translate - TODO: Translate - * دریافت آمار مرور کلمات
   */
  async getReviewStats(userId) {
    const totalWords = await WordProgress.count({
      where: { userId },
    });

    const dueWords = await WordProgress.count({
      where: {
        userId,
        nextReviewDate: {
          [Op.lte]: new Date(),
        },
      },
    });

    const masteredWords = await WordProgress.count({
      where: {
        userId,
        repetitions: {
          [Op.gte]: 5,
        },
      },
    });

    return {
      totalWords,
      dueWords,
      masteredWords,
    };
  }
}

export default new SpacedRepetitionService();
