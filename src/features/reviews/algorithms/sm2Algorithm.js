/**
 * sm2Algorithm.js
 * هدف: پیاده‌سازی الگوریتم SM-2 (SuperMemo 2) برای مرور فاصله‌دار
 * ارتباط: استفاده شده در ReviewSession و FlashcardDeck
 */

/**
 * پارامترهای پیش‌فرض الگوریتم SM-2
 */
const DEFAULT_PARAMS = {
  initialEaseFactor: 2.5,
  minimumEaseFactor: 1.3,
  easeFactorModifier: {
    correct: (quality) => {
      if (quality >= 3) return 0.1;
      return 0;
    },
    incorrect: (quality) => {
      if (quality < 3) return -0.2;
      return 0;
    },
  },
  intervalModifiers: {
    firstCorrect: 1,
    secondCorrect: 6,
    defaultMultiplier: (easeFactor) => easeFactor,
  },
  qualityThresholds: {
    perfect: 5,
    good: 4,
    hard: 3,
    wrong: 2,
    veryWrong: 1,
    blackout: 0,
  },
};

/**
 * کلاس اصلی الگوریتم SM-2
 */
export class SM2Algorithm {
  /**
   * محاسبه فاصله بعدی بر اساس کیفیت پاسخ
   * @param {Object} card - کارت فعلی (شامل easeFactor, interval, repetitions)
   * @param {number} quality - کیفیت پاسخ (0-5)
   * @returns {Object} کارت به‌روز شده
   */
  static calculateNextReview(card, quality) {
    if (!card) {
      throw new Error("Card object is required");
    }

    const newCard = { ...card };

    // به‌روزرسانی repetitions
    if (quality >= DEFAULT_PARAMS.qualityThresholds.good) {
      newCard.repetitions = (card.repetitions || 0) + 1;
    } else {
      newCard.repetitions = 0;
    }

    // به‌روزرسانی easeFactor
    let newEaseFactor = card.easeFactor || DEFAULT_PARAMS.initialEaseFactor;

    if (quality >= DEFAULT_PARAMS.qualityThresholds.good) {
      newEaseFactor += DEFAULT_PARAMS.easeFactorModifier.correct(quality);
    } else if (quality < DEFAULT_PARAMS.qualityThresholds.hard) {
      newEaseFactor += DEFAULT_PARAMS.easeFactorModifier.incorrect(quality);
    }

    newEaseFactor = Math.max(DEFAULT_PARAMS.minimumEaseFactor, newEaseFactor);
    newCard.easeFactor = newEaseFactor;

    // محاسبه فاصله (interval)
    let newInterval;

    if (newCard.repetitions === 1) {
      newInterval = DEFAULT_PARAMS.intervalModifiers.firstCorrect;
    } else if (newCard.repetitions === 2) {
      newInterval = DEFAULT_PARAMS.intervalModifiers.secondCorrect;
    } else {
      newInterval = Math.round((card.interval || 1) * newCard.easeFactor);
    }

    // اگر پاسخ اشتباه بود، فاصله رو ریست کن
    if (quality < DEFAULT_PARAMS.qualityThresholds.good) {
      newInterval = 1;
    }

    newCard.interval = Math.min(newInterval, 365); // حداکثر یک سال
    newCard.lastReviewDate = new Date().toISOString();
    newCard.nextReviewDate = this.calculateNextDate(newCard.interval);
    newCard.lastQuality = quality;

    return newCard;
  }

  /**
   * محاسبه تاریخ مرور بعدی
   */
  static calculateNextDate(daysInterval) {
    const date = new Date();
    date.setDate(date.getDate() + daysInterval);
    return date.toISOString();
  }

  /**
   * محاسبه کیفیت پاسخ بر اساس درصد صحت
   */
  static calculateQualityFromPercentage(percentage, responseTimeMs = null) {
    if (percentage === 100) {
      // زمان پاسخگویی هم می‌تونه تأثیر داشته باشه
      if (responseTimeMs !== null && responseTimeMs < 3000) {
        return DEFAULT_PARAMS.qualityThresholds.perfect; // 5 - عالی و سریع
      }
      return DEFAULT_PARAMS.qualityThresholds.good; // 4 - عالی
    }

    if (percentage >= 80) {
      return DEFAULT_PARAMS.qualityThresholds.hard; // 3 - خوب ولی کم‌تر از عالی
    }

    if (percentage >= 60) {
      return DEFAULT_PARAMS.qualityThresholds.wrong; // 2 - اشتباه
    }

    if (percentage >= 40) {
      return DEFAULT_PARAMS.qualityThresholds.veryWrong; // 1 - خیلی اشتباه
    }

    return DEFAULT_PARAMS.qualityThresholds.blackout; // 0 - کاملاً اشتباه
  }

  /**
   * بررسی آیا کارت برای مرور امروز است
   */
  static isDueForReview(card) {
    if (!card.nextReviewDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDate = new Date(card.nextReviewDate);
    nextDate.setHours(0, 0, 0, 0);

    return nextDate <= today;
  }

  /**
   * مرتب‌سازی کارت‌ها بر اساس اولویت مرور
   */
  static sortCardsByPriority(cards) {
    const now = new Date();

    return [...cards].sort((a, b) => {
      // اولویت 1: کارت‌های overdue
      const aDate = a.nextReviewDate ? new Date(a.nextReviewDate) : new Date(0);
      const bDate = b.nextReviewDate ? new Date(b.nextReviewDate) : new Date(0);

      const aOverdue = aDate < now;
      const bOverdue = bDate < now;

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // اولویت 2: فاصله کمتر
      return aDate.getTime() - bDate.getTime();
    });
  }

  /**
   * محاسبه آمار review session
   */
  static calculateSessionStats(cards, reviewedCards = []) {
    const totalCards = cards.length;
    const reviewed = reviewedCards.length;
    const remaining = totalCards - reviewed;

    const dueCards = cards.filter((c) => this.isDueForReview(c)).length;
    const newCards = cards.filter(
      (c) => !c.repetitions || c.repetitions === 0,
    ).length;
    const learningCards = cards.filter(
      (c) => c.repetitions > 0 && c.repetitions < 3,
    ).length;
    const matureCards = cards.filter((c) => c.repetitions >= 3).length;

    const retentionRate =
      reviewedCards.length > 0
        ? (reviewedCards.filter((c) => c.lastQuality >= 3).length /
            reviewedCards.length) *
          100
        : 0;

    return {
      totalCards,
      reviewed,
      remaining,
      dueCards,
      newCards,
      learningCards,
      matureCards,
      retentionRate,
      completionRate: totalCards > 0 ? (reviewed / totalCards) * 100 : 0,
    };
  }

  /**
   * به‌روزرسانی دسته‌جمعی کارت‌ها
   */
  static batchUpdateCards(cards, reviewResults) {
    const updatedCards = [...cards];

    for (const result of reviewResults) {
      const cardIndex = updatedCards.findIndex((c) => c.id === result.cardId);
      if (cardIndex !== -1) {
        updatedCards[cardIndex] = this.calculateNextReview(
          updatedCards[cardIndex],
          result.quality,
        );
      }
    }

    return updatedCards;
  }
}

/**
 * هوک ساده برای استفاده از الگوریتم در کامپوننت‌ها
 */
export function useSM2() {
  const calculateNextReview = (card, quality) => {
    return SM2Algorithm.calculateNextReview(card, quality);
  };

  const isDue = (card) => {
    return SM2Algorithm.isDueForReview(card);
  };

  const sortCards = (cards) => {
    return SM2Algorithm.sortCardsByPriority(cards);
  };

  const calculateQuality = (percentage, responseTime) => {
    return SM2Algorithm.calculateQualityFromPercentage(
      percentage,
      responseTime,
    );
  };

  const getStats = (cards, reviewedCards) => {
    return SM2Algorithm.calculateSessionStats(cards, reviewedCards);
  };

  return {
    calculateNextReview,
    isDue,
    sortCards,
    calculateQuality,
    getStats,
  };
}

export default SM2Algorithm;
