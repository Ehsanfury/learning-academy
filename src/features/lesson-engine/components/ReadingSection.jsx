/**
 * ReadingSection.jsx
 * هدف: تمرین مهارت خواندن با متن و سوالات درک مطلب
 * ارتباط: استفاده شده در sectionRenderer برای نوع 'reading'
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import {
  BookOpen,
  Volume2,
  Check,
  X,
  Eye,
  EyeOff,
  GraduationCap,
} from "lucide-react";
import Button from "@components/ui/Button";
import ProgressBar from "@components/ProgressBar";
import { cn } from "@utils/helpers";

function ReadingSection({ section, onComplete = null }) {
  const { language } = useLanguageContext();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState(null);

  const passage = section.passage;
  const questions = section.questions || [];
  const vocabularyHighlight = section.vocabularyHighlight || [];

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleTrueFalse = (questionId, value) => {
    handleAnswer(questionId, value);
  };

  const submitAnswers = () => {
    let correctCount = 0;
    const newScore = {};

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      let isCorrect = false;

      if (q.type === "true-false") {
        isCorrect = userAnswer === q.correct;
      } else if (q.type === "multiple-choice") {
        isCorrect = userAnswer === q.correct;
      } else if (q.type === "fill-blank") {
        const correctAnswer = q.correct?.toLowerCase().trim();
        const userAnswerTrimmed = userAnswer?.toLowerCase().trim();
        isCorrect = userAnswerTrimmed === correctAnswer;
      }

      if (isCorrect) correctCount++;
      newScore[q.id] = isCorrect;
    });

    const percentage = (correctCount / questions.length) * 100;
    setScore({
      correctCount,
      total: questions.length,
      percentage,
      details: newScore,
    });
    setSubmitted(true);

    if (percentage === 100) {
      onComplete?.({ sectionId: section.id, score: percentage });
    }
  };

  const resetExercise = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  const getPassageText = () => {
    return passage?.[language] || passage?.de || "";
  };

  const getTranslation = () => {
    if (language === "de") return passage?.en || passage?.fa;
    return passage?.de;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <BookOpen className="w-10 h-10 text-primary-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {language === "fa" ? "متن خواندنی" : "Reading Passage"}
        </h3>
      </div>

      {/* Translation Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600"
        >
          {showTranslation ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {showTranslation
            ? language === "fa"
              ? "مخفی کردن ترجمه"
              : "Hide Translation"
            : language === "fa"
              ? "نمایش ترجمه"
              : "Show Translation"}
        </button>
      </div>

      {/* Reading Passage */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-soft">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
            {getPassageText()}
          </p>
        </div>

        {showTranslation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-sm text-neutral-600 dark:text-neutral-400"
          >
            {getTranslation()}
          </motion.div>
        )}
      </div>

      {/* Audio Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            const utterance = new SpeechSynthesisUtterance(getPassageText());
            utterance.lang = language === "fa" ? "fa-IR" : "de-DE";
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-primary-100 transition-colors"
        >
          <Volume2 className="w-4 h-4 text-primary-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {language === "fa" ? "گوش دادن به متن" : "Listen to text"}
          </span>
        </button>
      </div>

      {/* Vocabulary Highlight */}
      {vocabularyHighlight.length > 0 && (
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary-500" />
            {language === "fa" ? "واژگان کلیدی" : "Key Vocabulary"}
          </h4>
          <div className="flex gap-2 flex-wrap">
            {vocabularyHighlight.map((item, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setHighlightedWord(
                    highlightedWord === item.word ? null : item.word,
                  )
                }
                className={cn(
                  "px-3 py-1 rounded-full text-sm transition-colors",
                  highlightedWord === item.word
                    ? "bg-primary-500 text-white"
                    : "bg-white dark:bg-neutral-700 text-neutral-600 hover:bg-primary-100",
                )}
              >
                {item.word}
              </button>
            ))}
          </div>
          {highlightedWord && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2 bg-primary-50 dark:bg-primary-950 rounded-lg text-sm text-primary-700 dark:text-primary-300"
            >
              {
                vocabularyHighlight.find((v) => v.word === highlightedWord)
                  ?.meaning?.[language]
              }
            </motion.div>
          )}
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && !submitted && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {language === "fa" ? "سوالات درک مطلب" : "Comprehension Questions"}
          </h3>

          {questions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-neutral-900 rounded-xl p-5 shadow-soft"
            >
              <p className="font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                {idx + 1}. {q.text?.[language]}
              </p>

              {q.type === "true-false" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleTrueFalse(q.id, true)}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl border-2 transition-all",
                      answers[q.id] === true
                        ? "border-success-500 bg-success-50 dark:bg-success-950 text-success-700"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-success-300",
                    )}
                  >
                    ✓ {language === "fa" ? "درست" : "True"}
                  </button>
                  <button
                    onClick={() => handleTrueFalse(q.id, false)}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl border-2 transition-all",
                      answers[q.id] === false
                        ? "border-danger-500 bg-danger-50 dark:bg-danger-950 text-danger-700"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-danger-300",
                    )}
                  >
                    ✗ {language === "fa" ? "نادرست" : "False"}
                  </button>
                </div>
              )}

              {q.type === "multiple-choice" && q.options && (
                <div className="space-y-2">
                  {q.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswer(q.id, optIdx)}
                      className={cn(
                        "w-full text-right px-4 py-3 rounded-xl border-2 transition-all",
                        answers[q.id] === optIdx
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "fill-blank" && (
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-primary-500 focus:outline-none"
                  placeholder={
                    language === "fa"
                      ? "پاسخ خود را بنویسید..."
                      : "Type your answer..."
                  }
                />
              )}
            </motion.div>
          ))}

          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={submitAnswers}
              disabled={Object.keys(answers).length !== questions.length}
            >
              {language === "fa" ? "ثبت پاسخ‌ها" : "Submit Answers"}
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {submitted && score && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-soft text-center"
        >
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
              score.percentage >= 80
                ? "bg-success-100 dark:bg-success-900"
                : score.percentage >= 60
                  ? "bg-warning-100 dark:bg-warning-900"
                  : "bg-danger-100 dark:bg-danger-900",
            )}
          >
            {score.percentage >= 80 ? (
              <Check className="w-10 h-10 text-success-500" />
            ) : (
              <BookOpen className="w-10 h-10 text-warning-500" />
            )}
          </div>

          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {score.percentage >= 80
              ? language === "fa"
                ? "عالی! 🎉"
                : "Excellent! 🎉"
              : score.percentage >= 60
                ? language === "fa"
                  ? "خوب بود!"
                  : "Good job!"
                : language === "fa"
                  ? "نیاز به تمرین بیشتر"
                  : "Need more practice"}
          </h3>

          <p className="text-neutral-500 mb-4">
            {score.correctCount} / {score.total}{" "}
            {language === "fa" ? "پاسخ صحیح" : "correct answers"}
          </p>

          <ProgressBar
            value={score.percentage}
            max={100}
            color="primary"
            showLabel
          />

          <div className="flex gap-3 justify-center mt-6">
            <Button variant="ghost" onClick={resetExercise}>
              {language === "fa" ? "تلاش مجدد" : "Try Again"}
            </Button>
            {score.percentage >= 80 && onComplete && (
              <Button
                variant="success"
                onClick={() =>
                  onComplete({ sectionId: section.id, score: score.percentage })
                }
              >
                {language === "fa" ? "ادامه درس" : "Continue"}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ReadingSection;
