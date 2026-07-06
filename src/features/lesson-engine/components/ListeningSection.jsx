/**
 * ListeningSection.jsx
 * هدف: تمرین مهارت شنیداری با فایل‌های صوتی و سوالات درک مطلب
 * ارتباط: استفاده شده در sectionRenderer برای نوع 'listening'
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import {
  Play,
  Pause,
  Volume2,
  Headphones,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import Button from "@components/ui/Button";
import ProgressBar from "@components/ProgressBar";
import { cn } from "@utils/helpers";

function ListeningSection({ section, onComplete = null }) {
  const { language } = useLanguageContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);

  const audioRef = useRef(null);

  const audioSrc = section.audio;
  const transcript = section.transcript;
  const questions = section.questions || [];
  const description = section.description?.[language];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleMultipleChoice = (questionId, optionIndex) => {
    handleAnswer(questionId, optionIndex);
  };

  const handleTextAnswer = (questionId, value) => {
    handleAnswer(questionId, value);
  };

  const submitAnswers = () => {
    let correctCount = 0;
    const newScore = {};

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      let isCorrect = false;

      if (q.type === "multiple-choice") {
        isCorrect = userAnswer === q.correct;
      } else {
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
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <audio ref={audioRef} src={audioSrc} />

      {/* Description */}
      {description && (
        <div className="text-center text-neutral-600 dark:text-neutral-400">
          <Headphones className="w-8 h-8 text-primary-500 mx-auto mb-3" />
          <p>{description}</p>
        </div>
      )}

      {/* Audio Player */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-950 dark:to-purple-950 rounded-2xl p-6">
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-white" />
            ) : (
              <Play className="w-7 h-7 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              if (audioRef.current) {
                audioRef.current.currentTime = percent * duration;
              }
            }}
          >
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Speed Control */}
        <div className="flex justify-center mt-4">
          <select
            onChange={(e) => {
              if (audioRef.current) {
                audioRef.current.playbackRate = parseFloat(e.target.value);
              }
            }}
            className="text-sm bg-white dark:bg-neutral-800 rounded-lg px-3 py-1 border border-neutral-200 dark:border-neutral-700"
            defaultValue="1"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>
      </div>

      {/* Transcript Toggle */}
      {transcript && (
        <div>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600"
          >
            <Volume2 className="w-4 h-4" />
            {showTranscript
              ? language === "fa"
                ? "مخفی کردن متن"
                : "Hide Transcript"
              : language === "fa"
                ? "نمایش متن"
                : "Show Transcript"}
          </button>

          <AnimatePresence>
            {showTranscript && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {transcript[language] || transcript.de}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

              {q.type === "multiple-choice" && (
                <div className="space-y-2">
                  {q.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => handleMultipleChoice(q.id, optIdx)}
                      className={cn(
                        "w-full text-right px-4 py-3 rounded-xl border-2 transition-all duration-200",
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
                  onChange={(e) => handleTextAnswer(q.id, e.target.value)}
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
            ) : score.percentage >= 60 ? (
              <RefreshCw className="w-10 h-10 text-warning-500" />
            ) : (
              <X className="w-10 h-10 text-danger-500" />
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
            {score.percentage === 100 && onComplete && (
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

export default ListeningSection;
