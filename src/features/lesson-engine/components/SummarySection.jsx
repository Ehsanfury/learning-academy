/**
 * SummarySection.jsx
 * هدف: خلاصه درس، مرور واژگان کلیدی و پیشنهاد درس بعدی
 * ارتباط: استفاده شده در sectionRenderer برای نوع 'summary'
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import {
  CheckCircle,
  BookOpen,
  Trophy,
  ArrowLeft,
  Zap,
  Calendar,
  Target,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Button from "@components/ui/Button";
import ProgressBar from "@components/ProgressBar";
import { cn } from "@utils/helpers";

function SummarySection({ section, onComplete = null, lessonData = {} }) {
  const { language } = useLanguageContext();
  const [showAllVocabulary, setShowAllVocabulary] = useState(false);

  const whatYouLearned = section.whatYouLearned?.[language] || [];
  const keyVocabulary = section.keyVocabulary || [];
  const nextSteps = section.nextSteps?.[language];
  const dailyPractice = section.dailyPractice?.[language];

  const lessonTitle = lessonData?.title?.[language] || "";
  const lessonXP = lessonData?.xpReward || 50;
  const perfectBonus = lessonData?.perfectBonusXP || 25;
  const estimatedMinutes = lessonData?.estimatedMinutes || 20;

  const [xpEarned] = useState(lessonXP);
  const [isPerfect, setIsPerfect] = useState(false);

  // Check if user completed all sections perfectly
  // اینجا می‌تونی منطق بررسی کامل بودن رو اضافه کنی

  const handleComplete = () => {
    onComplete?.({
      sectionId: section.id,
      completed: true,
      xpEarned: xpEarned + (isPerfect ? perfectBonus : 0),
      isPerfect,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Celebration Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {language === "fa" ? "آفرین! 🎉" : "Great Job! 🎉"}
        </h2>
        <p className="text-neutral-500">
          {language === "fa"
            ? `درس "${lessonTitle}" با موفقیت به پایان رسید`
            : `You completed "${lessonTitle}"`}
        </p>
      </motion.div>

      {/* XP Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-neutral-600 dark:text-neutral-400">
            {language === "fa" ? "امتیاز کسب شده" : "XP Earned"}
          </span>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              +{xpEarned} XP
            </span>
          </div>
        </div>
        {isPerfect && (
          <div className="flex items-center justify-between pt-3 border-t border-primary-200 dark:border-primary-800">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {language === "fa" ? "پاداش بی‌نقصی" : "Perfect Bonus"}
            </span>
            <span className="text-sm font-bold text-success-500">
              +{perfectBonus} XP
            </span>
          </div>
        )}
      </div>

      {/* What You Learned */}
      {whatYouLearned.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success-500" />
            {language === "fa" ? "آنچه یاد گرفتی" : "What You Learned"}
          </h3>
          <ul className="space-y-2">
            {whatYouLearned.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300"
              >
                <span className="text-primary-500 mt-0.5">✓</span>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Vocabulary */}
      {keyVocabulary.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-500" />
            {language === "fa" ? "واژگان کلیدی" : "Key Vocabulary"}
          </h3>
          <div className="grid gap-3">
            {(showAllVocabulary
              ? keyVocabulary
              : keyVocabulary.slice(0, 6)
            ).map((vocab, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
              >
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  {vocab.word}
                </span>
                <span className="text-sm text-neutral-500">
                  {vocab.meaning?.[language]}
                </span>
              </motion.div>
            ))}
          </div>
          {keyVocabulary.length > 6 && (
            <button
              onClick={() => setShowAllVocabulary(!showAllVocabulary)}
              className="mt-4 text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1 mx-auto"
            >
              {showAllVocabulary
                ? language === "fa"
                  ? "نمایش کمتر"
                  : "Show less"
                : language === "fa"
                  ? "نمایش همه"
                  : "Show all"}
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-transform",
                  showAllVocabulary && "rotate-90",
                )}
              />
            </button>
          )}
        </div>
      )}

      {/* Next Steps & Daily Practice */}
      <div className="grid gap-4">
        {nextSteps && (
          <div className="bg-primary-50 dark:bg-primary-950 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-primary-700 dark:text-primary-300 mb-1">
                  {language === "fa" ? "قدم بعدی" : "Next Step"}
                </h4>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  {nextSteps}
                </p>
              </div>
            </div>
          </div>
        )}

        {dailyPractice && (
          <div className="bg-amber-50 dark:bg-amber-950 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-1">
                  {language === "fa" ? "تمرین روزانه" : "Daily Practice"}
                </h4>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {dailyPractice}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {lessonData?.nextLessonId && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleComplete}
            fullWidth
            icon={ArrowLeft}
            iconPosition="left"
          >
            {language === "fa" ? "رفتن به درس بعدی" : "Next Lesson"}
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={handleComplete} fullWidth>
          {language === "fa"
            ? "بازگشت به مسیر یادگیری"
            : "Back to Learning Path"}
        </Button>
      </div>

      {/* Motivation Quote */}
      <div className="text-center pt-4">
        <p className="text-xs text-neutral-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          {language === "fa"
            ? "هر روز یک قدم به تسلط نزدیک‌تر می‌شی! 🌟"
            : "Every day you get one step closer to mastery! 🌟"}
        </p>
      </div>
    </div>
  );
}

export default SummarySection;
