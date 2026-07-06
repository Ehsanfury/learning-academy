/**
 * VocabularySection.jsx
 * هدف: نمایش و تمرین واژگان جدید درس
 * ارتباط: استفاده شده در sectionRenderer برای نوع 'vocabulary'
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import {
  Volume2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import Button from "@components/ui/Button";
import { cn } from "@utils/helpers";

function VocabularySection({
  section,
  onComplete = null,
  onWordReviewed = null,
  savedWords = [],
  onSaveWord = null,
}) {
  const { language } = useLanguageContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState([]);
  const [unknownWords, setUnknownWords] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const words = section.words || [];
  const totalWords = words.length;
  const currentWord = words[currentIndex];
  const isCompleted = knownWords.length + unknownWords.length === totalWords;

  const isWordSaved = (wordId) => {
    return savedWords.includes(wordId);
  };

  const playAudio = (audioUrl) => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play().catch(console.warn);
  };

  const markAsKnown = () => {
    if (knownWords.includes(currentWord.id)) return;

    setKnownWords([...knownWords, currentWord.id]);
    onWordReviewed?.(currentWord.id, true);
    nextWord();
  };

  const markAsUnknown = () => {
    if (unknownWords.includes(currentWord.id)) return;

    setUnknownWords([...unknownWords, currentWord.id]);
    onWordReviewed?.(currentWord.id, false);
    nextWord();
  };

  const nextWord = () => {
    setIsFlipped(false);
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // رسیدیم به آخر
      if (knownWords.length + unknownWords.length === totalWords) {
        onComplete?.({ knownWords, unknownWords });
      }
    }
  };

  const prevWord = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetPractice = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownWords([]);
    setUnknownWords([]);
  };

  const flipCard = () => setIsFlipped(!isFlipped);

  // حالت نمایش همه کلمات (جدول)
  if (showAll || isCompleted) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {section.title?.[language] || "Vocabulary"}
          </h3>
          {!isCompleted && (
            <Button variant="ghost" size="sm" onClick={() => setShowAll(false)}>
              {language === "fa" ? "بازگشت به تمرین" : "Back to Practice"}
            </Button>
          )}
        </div>

        {/* Progress Summary */}
        {isCompleted && (
          <div className="bg-success-50 dark:bg-success-950 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-success-700 dark:text-success-300">
                  {language === "fa"
                    ? `${knownWords.length} کلمه بلد بودی، ${unknownWords.length} کلمه نیاز به تمرین داره`
                    : `You knew ${knownWords.length} words, ${unknownWords.length} need practice`}
                </p>
              </div>
              <div className="w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray={`${(knownWords.length / totalWords) * 100}, 100`}
                  />
                  <text
                    x="18"
                    y="22.5"
                    textAnchor="middle"
                    className="text-xs font-bold fill-success-500"
                  >
                    {Math.round((knownWords.length / totalWords) * 100)}%
                  </text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Words Grid */}
        <div className="grid gap-3">
          {words.map((word) => (
            <div
              key={word.id}
              className={cn(
                "bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-soft",
                knownWords.includes(word.id) && "border-r-4 border-success-500",
                unknownWords.includes(word.id) &&
                  "border-r-4 border-warning-500",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {word.de}
                    </h4>
                    <button
                      onClick={() => playAudio(word.audio)}
                      className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Volume2 className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    {word[language]}
                  </p>
                  {word.transliteration && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {word.transliteration}
                    </p>
                  )}
                  {word.example && (
                    <div className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                        {word.example.de}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {word.example[language]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  {onSaveWord && (
                    <button
                      onClick={() => onSaveWord(word.id)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {isWordSaved(word.id) ? (
                        <BookmarkCheck className="w-4 h-4 text-primary-500" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>
                  )}
                  {knownWords.includes(word.id) && (
                    <Check className="w-5 h-5 text-success-500" />
                  )}
                  {unknownWords.includes(word.id) && (
                    <X className="w-5 h-5 text-warning-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Button */}
        {isCompleted && !showAll && (
          <div className="text-center pt-4">
            <Button
              variant="success"
              onClick={() => onComplete?.({ knownWords, unknownWords })}
            >
              {language === "fa" ? "ادامه درس" : "Continue Lesson"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // حالت فلش‌کارت (تمرین تعاملی)
  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-neutral-500">
          {knownWords.length + unknownWords.length} / {totalWords}
        </span>
        <span className="text-neutral-500">
          {language === "fa" ? "کلمه" : "words"}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-primary-500 rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${((knownWords.length + unknownWords.length) / totalWords) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Flashcard */}
      <motion.div
        className="relative w-full aspect-[4/3] cursor-pointer mb-6"
        onClick={flipCard}
      >
        <motion.div
          className="w-full h-full preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-neutral-900 rounded-3xl shadow-soft flex flex-col items-center justify-center p-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAudio(currentWord?.audio);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Volume2 className="w-5 h-5 text-neutral-400" />
            </button>
            <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-4 text-center">
              {currentWord?.de}
            </p>
            {currentWord?.timeContext && (
              <p className="text-xs text-neutral-400 mt-2">
                {currentWord.timeContext}
              </p>
            )}
            <p className="text-xs text-neutral-400 absolute bottom-4">
              {language === "fa"
                ? "ضربه بزن برای دیدن معنی"
                : "Tap to see meaning"}
            </p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-neutral-900 rounded-3xl shadow-soft flex flex-col items-center justify-center p-8 rotateY-180">
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 text-center">
              {currentWord?.[language]}
            </p>
            {currentWord?.transliteration && (
              <p className="text-sm text-neutral-500 mb-4">
                {currentWord.transliteration}
              </p>
            )}
            {currentWord?.example && (
              <div className="text-center mt-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {currentWord.example.de}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button variant="danger" size="lg" onClick={markAsUnknown} icon={X}>
          {language === "fa" ? "بلد نیستم" : "Don't Know"}
        </Button>
        <Button variant="success" size="lg" onClick={markAsKnown} icon={Check}>
          {language === "fa" ? "بلد هستم" : "Know It"}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevWord}
          disabled={currentIndex === 0}
          icon={ChevronRight}
        >
          {language === "fa" ? "قبلی" : "Previous"}
        </Button>

        <Button variant="ghost" size="sm" onClick={resetPractice}>
          {language === "fa" ? "شروع مجدد" : "Reset"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={nextWord}
          disabled={currentIndex === totalWords - 1}
          icon={ChevronLeft}
          iconPosition="left"
        >
          {language === "fa" ? "بعدی" : "Next"}
        </Button>
      </div>

      {/* Hint */}
      {section.memorizationHint && (
        <div className="mt-6 p-3 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
          <p className="text-xs text-primary-600 dark:text-primary-400">
            💡 {section.memorizationHint[language]}
          </p>
        </div>
      )}
    </div>
  );
}

export default VocabularySection;
