/**
 * ExerciseEngine.jsx
 * Path: src/components/exercise/ExerciseEngine.jsx
 * Description: Exercise engine with full question type support
 * Version: 4.7 - FIXED: Pronunciation words extraction
 * Changes:
 * - ✅ FIXED: Added 'words' extraction for pronunciation exercises
 * - ✅ FIXED: Pronunciation questions now display correctly
 * - ✅ FIXED: Better handling of all question types
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Target,
  Volume2,
  Mic,
  Users,
  Play,
  Loader2,
} from "lucide-react";
import { cn } from "../../utils/helpers";
import { useLanguage } from "../../context/LanguageContext";

const ExerciseEngine = ({
  exercise,
  questions: propQuestions,
  onComplete,
  onNext,
  onPrevious,
  isFirst = false,
  isLast = false,
  className,
  language: propLanguage,
}) => {
  const { language: contextLanguage } = useLanguage();
  const language = propLanguage || contextLanguage;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // ✅ FIXED: استخراج سوالات از ساختارهای مختلف
  const extractQuestions = useCallback((exerciseData) => {
    if (!exerciseData) return [];

    // 1. اگر سوالات مستقیم وجود دارد
    if (
      exerciseData.questions &&
      Array.isArray(exerciseData.questions) &&
      exerciseData.questions.length > 0
    ) {
      return exerciseData.questions;
    }

    // 2. اگر data.questions وجود دارد
    if (
      exerciseData.data?.questions &&
      Array.isArray(exerciseData.data.questions)
    ) {
      return exerciseData.data.questions;
    }

    // 3. اگر quiz وجود دارد
    if (exerciseData.quiz && Array.isArray(exerciseData.quiz)) {
      return exerciseData.quiz;
    }

    // 4. اگر items وجود دارد
    if (exerciseData.items && Array.isArray(exerciseData.items)) {
      return exerciseData.items;
    }

    // ✅ 5. FIXED: اگر words وجود دارد (برای تلفظ)
    if (exerciseData.words && Array.isArray(exerciseData.words)) {
      return exerciseData.words.map((word, index) => ({
        id: word.id || `pronounce-${index}`,
        type: "pronunciation",
        word: word.word,
        persian: word.persian,
        meaning: word.meaning || "",
        ipa: word.ipa || "",
        wordData: word,
      }));
    }

    // 6. اگر خود exerciseData یک آرایه است
    if (Array.isArray(exerciseData)) {
      return exerciseData;
    }

    return [];
  }, []);

  // ✅ استفاده از useMemo برای سوالات
  const allQuestions = useMemo(() => {
    return propQuestions || extractQuestions(exercise);
  }, [propQuestions, exercise, extractQuestions]);

  // ✅ Reset state when questions change
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setShowFeedback(false);
    setAudioError(false);
  }, [allQuestions]);

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {language === "fa"
            ? "هیچ سوالی برای این تمرین وجود ندارد"
            : "No questions available"}
        </p>
      </div>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = allQuestions.length;

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowFeedback(false);
      setAudioError(false);
    } else {
      let correct = 0;
      allQuestions.forEach((q) => {
        const userAnswer = answers[q.id];
        if (userAnswer !== undefined && userAnswer !== null) {
          if (q.type === "multiple_choice" || q.type === "match_situation") {
            if (userAnswer === q.correct || userAnswer === q.correctIndex) {
              correct++;
            }
          } else if (q.type === "true_false") {
            const normalizedUser = String(userAnswer).toLowerCase();
            const normalizedCorrect =
              typeof q.answer === "boolean"
                ? String(q.answer).toLowerCase()
                : String(q.answer || "").toLowerCase();
            if (normalizedUser === normalizedCorrect) {
              correct++;
            }
          } else if (q.type === "fill_in" || q.type === "gap_fill") {
            const userAns = String(userAnswer || "")
              .toLowerCase()
              .trim();
            const correctAns = String(q.answer || "")
              .toLowerCase()
              .trim();
            if (userAns === correctAns) {
              correct++;
            }
          } else if (q.type === "role_play" || q.type === "pronunciation") {
            if (userAnswer === "done" || userAnswer === true) {
              correct++;
            }
          }
        }
      });

      const calculatedScore = Math.round((correct / totalQuestions) * 100);
      setScore(calculatedScore);
      setCorrectCount(correct);
      setShowResults(true);

      if (onComplete) {
        onComplete({
          score: calculatedScore,
          correct,
          total: totalQuestions,
          answers,
          earnedXP: exercise?.xpReward || Math.round(calculatedScore / 10),
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowFeedback(false);
      setAudioError(false);
    }
  };

  // ✅ Speak text with better error handling
  const speakText = useCallback((text, lang = "de-DE") => {
    setAudioError(false);

    if (!window.speechSynthesis) {
      setAudioError(true);
      console.warn("Speech synthesis not supported");
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.warn("Speech error:", event);
        setIsSpeaking(false);
        setAudioError(true);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setIsSpeaking(false);
      setAudioError(true);
    }
  }, []);

  // ✅ Safe text converter
  const getSafeText = useCallback(
    (value) => {
      if (!value) return "";
      if (typeof value === "string") return value;
      if (typeof value === "number") return String(value);
      if (Array.isArray(value)) {
        return value.map((v) => getSafeText(v)).join(", ");
      }
      if (typeof value === "object") {
        if (value.fa || value.en || value.de) {
          return value[language] || value.fa || value.en || value.de || "";
        }
        try {
          return JSON.stringify(value);
        } catch {
          return "";
        }
      }
      return String(value);
    },
    [language],
  );

  const getQuestionText = useCallback(
    (q) => {
      if (!q) return "";
      if (typeof q === "string") return q;
      if (typeof q === "number") return String(q);

      if (q.question) return getSafeText(q.question);
      if (q.text) return getSafeText(q.text);
      if (q.prompt) return getSafeText(q.prompt);
      if (q.situation) return getSafeText(q.situation);
      if (q.questionText) return getSafeText(q.questionText);

      // ✅ برای سوالات تلفظ
      if (q.word) return `تلفظ کلمه "${q.word}"`;
      if (q.persian) return `تلفظ: ${q.persian}`;

      return getSafeText(q);
    },
    [getSafeText],
  );

  const getOptions = useCallback(
    (q) => {
      if (!q) return [];
      if (q.options && Array.isArray(q.options)) {
        return q.options.map((opt) => getSafeText(opt));
      }
      if (q.choices && Array.isArray(q.choices)) {
        return q.choices;
      }
      return [];
    },
    [getSafeText],
  );

  const getCorrectAnswer = useCallback((q) => {
    if (q.correct !== undefined) return q.correct;
    if (q.correctIndex !== undefined) return q.correctIndex;
    if (q.answer !== undefined) return q.answer;
    return 0;
  }, []);

  const getQuestionType = useCallback((q) => {
    return q.type || "multiple_choice";
  }, []);

  const isCurrentQuestionAnswered = useCallback(() => {
    const answer = answers[currentQuestion?.id];
    return answer !== undefined && answer !== null && answer !== "";
  }, [answers, currentQuestion]);

  // ✅ FIXED: Get pronunciation word
  const getPronunciationWord = useCallback(
    (q) => {
      if (!q) return "";
      // بررسی ساختار‌های مختلف
      if (q.word) return q.word;
      if (q.text) return q.text;
      if (q.question) return q.question;
      if (q.sentence) return q.sentence;
      if (q.german) return q.german;
      if (q.de) return q.de;
      if (q.wordData?.word) return q.wordData.word;
      // اگر همه چیز null بود، از خود سوال استفاده کن
      return getSafeText(q);
    },
    [getSafeText],
  );

  const renderQuestion = () => {
    if (showResults) {
      return (
        <div className="text-center py-8">
          <div className="mb-6">
            {score >= 70 ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
          </div>
          <h3 className="text-2xl font-bold mb-2">
            {score >= 70
              ? language === "fa"
                ? "🎉 عالی!"
                : "🎉 Excellent!"
              : language === "fa"
                ? "💪 ادامه بده!"
                : "Keep Practicing!"}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {language === "fa"
              ? `شما ${correctCount} از ${totalQuestions} سوال را درست پاسخ دادید (${score}%)`
              : `You got ${correctCount} out of ${totalQuestions} correct (${score}%)`}
          </p>
          <div className="mt-4">
            <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={cn(
                  "h-4 rounded-full transition-all duration-500",
                  score >= 70 ? "bg-green-500" : "bg-yellow-500",
                )}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => onNext && onNext()}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === "fa" ? "ادامه" : "Continue"}
          </button>
        </div>
      );
    }

    const qType = getQuestionType(currentQuestion);
    const options = getOptions(currentQuestion);
    const correct = getCorrectAnswer(currentQuestion);
    const qText = getQuestionText(currentQuestion);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {language === "fa"
              ? `سوال ${currentQuestionIndex + 1} از ${totalQuestions}`
              : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
          </span>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {exercise?.xpReward || 10} XP
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-medium mb-4">{qText}</h4>

          {/* multiple_choice */}
          {qType === "multiple_choice" && (
            <div className="space-y-3">
              {options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === index;
                const isCorrect = showFeedback && index === correct;
                const isWrong = showFeedback && isSelected && index !== correct;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, index)}
                    disabled={showFeedback}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border-2 transition-all",
                      isSelected && !showFeedback
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-400",
                      isCorrect && showFeedback
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "",
                      isWrong && showFeedback
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {isCorrect && showFeedback && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {isWrong && showFeedback && (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* match_situation */}
          {qType === "match_situation" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {language === "fa"
                  ? "گزینه درست را انتخاب کنید:"
                  : "Choose the correct option:"}
              </p>
              {options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === index;
                const isCorrect = showFeedback && index === correct;
                const isWrong = showFeedback && isSelected && index !== correct;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, index)}
                    disabled={showFeedback}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border-2 transition-all",
                      isSelected && !showFeedback
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-400",
                      isCorrect && showFeedback
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "",
                      isWrong && showFeedback
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {isCorrect && showFeedback && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {isWrong && showFeedback && (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* true_false */}
          {qType === "true_false" && (
            <div className="flex gap-4">
              {["True", "False"].map((value) => {
                const isSelected = answers[currentQuestion.id] === value;
                const isCorrect = showFeedback && value === correct;
                const isWrong = showFeedback && isSelected && value !== correct;

                return (
                  <button
                    key={value}
                    onClick={() => handleAnswer(currentQuestion.id, value)}
                    disabled={showFeedback}
                    className={cn(
                      "flex-1 px-6 py-3 rounded-lg border-2 transition-all",
                      isSelected && !showFeedback
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-400",
                      isCorrect && showFeedback
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "",
                      isWrong && showFeedback
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}

          {/* fill_in */}
          {qType === "fill_in" && (
            <div>
              <input
                type="text"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleAnswer(currentQuestion.id, e.target.value)
                }
                disabled={showFeedback}
                placeholder={
                  language === "fa"
                    ? "پاسخ خود را بنویسید..."
                    : "Type your answer..."
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none dark:bg-gray-900"
              />
              {showFeedback && (
                <p
                  className={cn(
                    "mt-2 text-sm",
                    String(answers[currentQuestion.id] || "")
                      .toLowerCase()
                      .trim() ===
                      String(correct || "")
                        .toLowerCase()
                        .trim()
                      ? "text-green-600"
                      : "text-red-600",
                  )}
                >
                  {String(answers[currentQuestion.id] || "")
                    .toLowerCase()
                    .trim() ===
                  String(correct || "")
                    .toLowerCase()
                    .trim()
                    ? "✅ " + (language === "fa" ? "درست!" : "Correct!")
                    : `❌ ${language === "fa" ? "پاسخ صحیح" : "Correct answer"}: ${correct}`}
                </p>
              )}
            </div>
          )}

          {/* role_play */}
          {qType === "role_play" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {language === "fa"
                      ? "🎭 نقش خود را اجرا کنید"
                      : "🎭 Play your role"}
                  </p>
                </div>
                {currentQuestion.speaker && (
                  <p className="text-sm font-medium mt-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      {currentQuestion.speaker}:
                    </span>{" "}
                    {currentQuestion.german || currentQuestion.text}
                  </p>
                )}
                {currentQuestion.meaning && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    📖 {getSafeText(currentQuestion.meaning)}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  💡 {language === "fa" ? "با صدای بلند بخوانید" : "Read aloud"}
                </p>
              </div>
              <button
                onClick={() => handleAnswer(currentQuestion.id, "done")}
                disabled={showFeedback}
                className={cn(
                  "w-full px-6 py-3 rounded-lg transition-colors text-white font-medium",
                  showFeedback
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600",
                )}
              >
                {showFeedback ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {language === "fa" ? "✅ انجام شد" : "✅ Done"}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    {language === "fa" ? "انجام دادم" : "I did it"}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ✅ FIXED: pronunciation with audio */}
          {qType === "pronunciation" && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-purple-500" />
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {language === "fa" ? "🎤 تلفظ کلمه" : "🎤 Pronunciation"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const wordToSpeak = getPronunciationWord(currentQuestion);
                      if (wordToSpeak) {
                        speakText(String(wordToSpeak), "de-DE");
                      }
                    }}
                    disabled={isSpeaking}
                    className={cn(
                      "p-2 rounded-full transition-colors flex items-center justify-center min-w-[40px]",
                      isSpeaking
                        ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                        : "bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800",
                    )}
                    title={
                      language === "fa" ? "پخش تلفظ" : "Play pronunciation"
                    }
                  >
                    {isSpeaking ? (
                      <Loader2 className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    )}
                  </button>
                </div>

                <div className="text-center py-3">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {getPronunciationWord(currentQuestion)}
                  </p>
                  {currentQuestion.persian && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      📖 {currentQuestion.persian}
                    </p>
                  )}
                  {currentQuestion.meaning && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {getSafeText(currentQuestion.meaning)}
                    </p>
                  )}
                  {audioError && (
                    <p className="text-xs text-amber-500 mt-2">
                      ⚠️{" "}
                      {language === "fa"
                        ? "تلفظ در دسترس نیست"
                        : "Pronunciation unavailable"}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2 text-center">
                  🎤{" "}
                  {language === "fa"
                    ? "بعد از گوش دادن، با صدای بلند تکرار کنید"
                    : "Listen and repeat aloud"}
                </p>
              </div>
              <button
                onClick={() => handleAnswer(currentQuestion.id, "done")}
                disabled={showFeedback}
                className={cn(
                  "w-full px-6 py-3 rounded-lg transition-colors text-white font-medium",
                  showFeedback
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600",
                )}
              >
                {showFeedback ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {language === "fa" ? "✅ تکرار شد" : "✅ Repeated"}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Mic className="w-5 h-5" />
                    {language === "fa" ? "تکرار کردم" : "I repeated"}
                  </span>
                )}
              </button>
            </div>
          )}

          {showFeedback && currentQuestion.explanation && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 {getSafeText(currentQuestion.explanation)}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={isFirst && currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === "fa" ? "قبلی" : "Previous"}
          </button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === "fa" ? "مشاهده نتایج" : "See Results"}
              <CheckCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === "fa" ? "بعدی" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-4", className)}>
      {renderQuestion()}
    </div>
  );
};

export default ExerciseEngine;
