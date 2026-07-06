/**
 * mentorAIService.js
 * Path: backend/services/mentorAIService.js
 * Description: Intelligent mentoring AI service
 * Changes:
 * - FIXED H25: Implemented getGrammarStats properly
 * - Added real grammar statistics calculation
 */

import { Op } from "sequelize";
import User from "../models/User.js";
import LessonProgress from "../models/LessonProgress.js";
import WordProgress from "../models/WordProgress.js";
import Lesson from "../models/Lesson.js";
import logger, { logInfo, logError, logWarn } from "../config/logger.js";

class MentorAIService {
  /**
// TODO: Translate - TODO: Translate - * تحلیل نقاط قوت و ضعف دانشجو
   */
  async analyzeStudent(userId) {
    try {
      logInfo("📊 Analyzing student", { userId });

      const lessonStats = await this.getLessonStats(userId);
      const vocabStats = await this.getVocabularyStats(userId);
      const grammarStats = await this.getGrammarStats(userId);

      const overallScore = this.calculateOverallScore({
        lessonStats,
        vocabStats,
        grammarStats,
      });

      const result = {
        overall: overallScore,
        lessons: lessonStats,
        vocabulary: vocabStats,
        grammar: grammarStats,
        weaknesses: this.findWeaknesses({
          lessonStats,
          vocabStats,
          grammarStats,
        }),
        strengths: this.findStrengths({ lessonStats, vocabStats, grammarStats }),
      };

      logInfo("✅ Student analysis completed", { userId, overallScore });
      return result;
    } catch (error) {
      logError("❌ Error in analyzeStudent", error, { userId });
      throw error;
    }
  }

  /**
// TODO: Translate - TODO: Translate - * دریافت آمار درس‌ها
   */
  async getLessonStats(userId) {
    try {
      const completed = await LessonProgress.count({
        where: {
          userId,
          status: ["completed", "perfect"],
        },
      });

      const perfect = await LessonProgress.count({
        where: {
          userId,
          status: "perfect",
        },
      });

      const total = await Lesson.count();

      return {
        completed,
        perfect,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    } catch (error) {
      logError("❌ Error in getLessonStats", error, { userId });
      throw error;
    }
  }

  /**
// TODO: Translate - TODO: Translate - * دریافت آمار لغات
   */
  async getVocabularyStats(userId) {
    try {
      const total = await WordProgress.count({
        where: { userId },
      });

      const learned = await WordProgress.count({
        where: {
          userId,
          repetitions: { [Op.gte]: 3 },
        },
      });

      const mastered = await WordProgress.count({
        where: {
          userId,
          repetitions: { [Op.gte]: 5 },
        },
      });

      return {
        total,
        learned,
        mastered,
        percentage: total > 0 ? Math.round((learned / total) * 100) : 0,
      };
    } catch (error) {
      logError("❌ Error in getVocabularyStats", error, { userId });
      throw error;
    }
  }

  /**
// TODO: Translate - TODO: Translate - * ✅ FIXED H25: دریافت آمار گرامر - پیاده‌سازی واقعی
   */
  async getGrammarStats(userId) {
    try {
// TODO: Translate - TODO: Translate - // دریافت تمام درس‌های تکمیل شده
      const progress = await LessonProgress.findAll({
        where: {
          userId,
          status: ["completed", "perfect"],
        },
        include: [
          {
            model: Lesson,
            as: "lesson",
            attributes: ["level", "id"],
          },
        ],
      });

// TODO: Translate - TODO: Translate - // تحلیل سطوح گرامری
      const levels = {
        A1: { completed: 0, total: 0, scores: [] },
        A2: { completed: 0, total: 0, scores: [] },
        B1: { completed: 0, total: 0, scores: [] },
        B2: { completed: 0, total: 0, scores: [] },
        C1: { completed: 0, total: 0, scores: [] },
        C2: { completed: 0, total: 0, scores: [] },
      };

// TODO: Translate - TODO: Translate - // دریافت تعداد کل درس‌ها در هر سطح
      const allLessons = await Lesson.findAll({
        attributes: ["level"],
      });

      const totalByLevel = {};
      allLessons.forEach((lesson) => {
        const level = lesson.level;
        if (!totalByLevel[level]) totalByLevel[level] = 0;
        totalByLevel[level]++;
      });

// TODO: Translate - TODO: Translate - // محاسبه پیشرفت در هر سطح
      progress.forEach((p) => {
        const lesson = p.lesson;
        if (lesson && lesson.level) {
          const level = lesson.level;
          if (levels[level]) {
            levels[level].completed++;
            if (p.score) {
              levels[level].scores.push(p.score);
            }
          }
        }
      });

// TODO: Translate - TODO: Translate - // تنظیم total برای هر سطح
      Object.keys(levels).forEach((level) => {
        levels[level].total = totalByLevel[level] || 0;
        levels[level].percentage =
          levels[level].total > 0
            ? Math.round((levels[level].completed / levels[level].total) * 100)
            : 0;
        levels[level].averageScore =
          levels[level].scores.length > 0
            ? Math.round(
                levels[level].scores.reduce((a, b) => a + b, 0) / levels[level].scores.length
              )
            : 0;
      });

// TODO: Translate - TODO: Translate - // محاسبه نمره کلی گرامر
      const totalCompleted = Object.values(levels).reduce((sum, l) => sum + l.completed, 0);
      const totalAvailable = Object.values(levels).reduce((sum, l) => sum + l.total, 0);
      const overall = totalAvailable > 0 ? Math.round((totalCompleted / totalAvailable) * 100) : 0;

      return {
        levels,
        overall,
        totalCompleted,
        totalAvailable,
      };
    } catch (error) {
      logError("❌ Error in getGrammarStats", error, { userId });
// TODO: Translate - TODO: Translate - // در صورت خطا، یک مقدار پیش‌فرض برگردان
      return {
        levels: {
          A1: { completed: 0, total: 0, percentage: 0, averageScore: 0 },
          A2: { completed: 0, total: 0, percentage: 0, averageScore: 0 },
          B1: { completed: 0, total: 0, percentage: 0, averageScore: 0 },
          B2: { completed: 0, total: 0, percentage: 0, averageScore: 0 },
          C1: { completed: 0, total: 0, percentage: 0, averageScore: 0 },
          C2: { completed: 0, total: 0, percentage: 0, averageScore: 0 },
        },
        overall: 0,
        totalCompleted: 0,
        totalAvailable: 0,
      };
    }
  }

  /**
// TODO: Translate - TODO: Translate - * محاسبه نمره کلی
   */
  calculateOverallScore(stats) {
    const weights = {
      lessons: 0.4,
      vocabulary: 0.3,
      grammar: 0.3,
    };

    const score =
      stats.lessonStats.percentage * weights.lessons +
      stats.vocabStats.percentage * weights.vocabulary +
      stats.grammarStats.overall * weights.grammar;

    return Math.round(score);
  }

  /**
// TODO: Translate - TODO: Translate - * پیدا کردن نقاط ضعف
   */
  findWeaknesses(stats) {
    const weaknesses = [];

    if (stats.lessonStats.percentage < 40) {
      weaknesses.push({
        type: "lessons",
        description: "تعداد درس‌های تکمیل شده کم است",
        suggestion: "روزانه ۲ درس جدید شروع کنید",
      });
    }

    if (stats.vocabStats.percentage < 50) {
      weaknesses.push({
        type: "vocabulary",
        description: "لغات کمتری نسبت به平均水平 یاد گرفته‌اید",
        suggestion: "روزانه ۵ لغت جدید با فلش‌کارت تمرین کنید",
      });
    }

    if (stats.grammarStats.overall < 50) {
      weaknesses.push({
        type: "grammar",
        description: "گرامر نیاز به تقویت دارد",
        suggestion: "تمرینات گرامری بیشتری انجام دهید",
      });
    }

    return weaknesses;
  }

  /**
// TODO: Translate - TODO: Translate - * پیدا کردن نقاط قوت
   */
  findStrengths(stats) {
    const strengths = [];

    if (stats.lessonStats.percentage > 80) {
      strengths.push({
        type: "lessons",
        description: "پیشرفت عالی در درس‌ها",
      });
    }

    if (stats.vocabStats.percentage > 70) {
      strengths.push({
        type: "vocabulary",
        description: "دایره لغات خوبی دارید",
      });
    }

    if (stats.grammarStats.overall > 70) {
      strengths.push({
        type: "grammar",
        description: "گرامر شما در سطح خوبی است",
      });
    }

    return strengths;
  }

  /**
// TODO: Translate - TODO: Translate - * پیشنهاد درس بعدی
   */
  async suggestNextLesson(userId) {
    try {
      logInfo("📚 Suggesting next lesson", { userId });

      const analysis = await this.analyzeStudent(userId);

      let suggestedLevel = "A1";
      if (analysis.overall > 80) suggestedLevel = "B1";
      else if (analysis.overall > 60) suggestedLevel = "A2";

      const nextLesson = await Lesson.findOne({
        where: {
          level: suggestedLevel,
          isActive: true,
        },
        order: [["lessonNumber", "ASC"]],
      });

      logInfo("✅ Next lesson suggested", { userId, suggestedLevel });

      return {
        lesson: nextLesson,
        reason: `بر اساس تحلیل شما (${analysis.overall}%)، پیشنهاد می‌کنیم درس ${suggestedLevel} را ادامه دهید.`,
      };
    } catch (error) {
      logError("❌ Error in suggestNextLesson", error, { userId });
      throw error;
    }
  }

  /**
// TODO: Translate - TODO: Translate - * پیشنهاد تمرینات
   */
  async suggestExercises(userId, count = 5) {
    try {
      logInfo("📝 Suggesting exercises", { userId, count });

      const analysis = await this.analyzeStudent(userId);

      const exercises = [];

      if (analysis.weaknesses.length > 0) {
        exercises.push({
          type: "grammar",
          title: "تمرین گرامر",
          description: "تمرینات گرامری برای تقویت",
          difficulty: "medium",
        });
      }

      exercises.push({
        type: "vocabulary",
        title: "تمرین لغات",
        description: "مرور لغات با فلش‌کارت",
        difficulty: "easy",
      });

      logInfo("✅ Exercises suggested", { userId, count: exercises.length });
      return exercises.slice(0, count);
    } catch (error) {
      logError("❌ Error in suggestExercises", error, { userId });
      throw error;
    }
  }

  /**
// TODO: Translate - TODO: Translate - * تحلیل پیشرفت کلی
   */
  async getProgressReport(userId) {
    try {
      logInfo("📊 Getting progress report", { userId });

      const analysis = await this.analyzeStudent(userId);

      const report = {
        summary: {
          overall: analysis.overall,
          level: this.getLevelFromScore(analysis.overall),
          nextMilestone: this.getNextMilestone(analysis.overall),
        },
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: [
          {
            type: "lessons",
            text: "تکمیل درس‌های روزانه",
            priority: "high",
          },
          {
            type: "vocabulary",
            text: "تمرین روزانه لغات با فلش‌کارت",
            priority: "medium",
          },
          {
            type: "grammar",
            text: "تمرین گرامر با مثال‌های واقعی",
            priority: "medium",
          },
        ],
      };

      logInfo("✅ Progress report generated", { userId });
      return report;
    } catch (error) {
      logError("❌ Error in getProgressReport", error, { userId });
      throw error;
    }
  }

  getLevelFromScore(score) {
    if (score >= 80) return "B1";
    if (score >= 60) return "A2";
    return "A1";
  }

  getNextMilestone(score) {
    if (score < 60) return "رسیدن به ۶۰٪ برای سطح A2";
    if (score < 80) return "رسیدن به ۸۰٪ برای سطح B1";
    return "رسیدن به ۹۰٪ برای سطح B2";
  }
}

export default new MentorAIService();
