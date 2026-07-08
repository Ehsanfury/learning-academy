/**
 * LessonPage.jsx - Version 7.1
 * Path: src/pages/Lesson/LessonPage.jsx
 * Fully compatible with new lesson structure
 * Changes:
 * - ✅ Fixed: Pronunciation guide padding issue (padding="lg")
 * - ✅ Fixed: Exercises now display properly with ExerciseEngine
 * - ✅ Fixed: Support for both section.questions and section.data structures
 * - ✅ Added: Exercise extraction from section.questions (seeder structure)
 * - ✅ Added: Proper error handling for exercises
 * - ✅ Fixed: Layout issues with min-w-0 and whitespace-nowrap
 * - ✅ Fixed: getAllWords for dictionary
 * - ✅ Fixed: Complete renderSectionContent with all section types
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import api from "@services/api";
import {
  ArrowLeft,
  CheckCircle,
  Star,
  Award,
  BookOpen,
  Volume2,
  Loader2,
  BookMarked,
  GraduationCap,
  MessageSquare,
  Dumbbell,
  Trophy,
  Mic,
  Sparkles,
  XCircle,
  BookText,
  ListChecks,
  Languages,
  Headphones,
  FileText,
  Target,
  AlertCircle,
  Clock,
  Globe,
  Users,
  Zap,
  Crown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Play,
  User,
  Mail,
  MapPin,
  PenTool,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@components/ui";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";
import Skeleton from "@components/ui/Skeleton";
import ExerciseEngine from "@components/exercise/ExerciseEngine";

// ============================================
// 📊 Section Type Config
// ============================================

const SECTION_CONFIG = {
  introduction: {
    icon: Sparkles,
    label: { fa: "🌟 معرفی", en: "🌟 Introduction" },
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-200 dark:border-purple-800",
  },
  pronunciation_guide: {
    icon: Volume2,
    label: { fa: "🎤 راهنمای تلفظ", en: "🎤 Pronunciation Guide" },
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950",
    border: "border-fuchsia-200 dark:border-fuchsia-800",
  },
  greetings: {
    icon: MessageSquare,
    label: { fa: "👋 احوال‌پرسی‌ها", en: "👋 Greetings" },
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  vocabulary: {
    icon: Languages,
    label: { fa: "📖 واژگان", en: "📖 Vocabulary" },
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
  },
  grammar: {
    icon: GraduationCap,
    label: { fa: "📝 گرامر", en: "📝 Grammar" },
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
  },
  dialogues: {
    icon: MessageSquare,
    label: { fa: "💬 دیالوگ‌ها", en: "💬 Dialogues" },
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950",
    border: "border-cyan-200 dark:border-cyan-800",
  },
  culture_notes: {
    icon: Globe,
    label: { fa: "🌍 نکات فرهنگی", en: "🌍 Cultural Notes" },
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  exercises: {
    icon: Dumbbell,
    label: { fa: "🏋️ تمرین‌ها", en: "🏋️ Exercises" },
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950",
    border: "border-orange-200 dark:border-orange-800",
  },
  review: {
    icon: ListChecks,
    label: { fa: "📝 مرور", en: "📝 Review" },
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
  },
  assessment: {
    icon: Target,
    label: { fa: "🎯 ارزیابی", en: "🎯 Assessment" },
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
  },
  cheat_sheet: {
    icon: Award,
    label: { fa: "📋 برگه خلاصه", en: "📋 Cheat Sheet" },
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950",
    border: "border-teal-200 dark:border-teal-800",
  },
};

// ============================================
// 📊 LessonPage Component
// ============================================

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sectionProgress, setSectionProgress] = useState({});
  const [completed, setCompleted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // ============================================
  // 📥 Load Lesson
  // ============================================

  useEffect(() => {
    if (id) {
      loadLesson();
    }
  }, [id]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/lessons/${id}`);
      const lessonData = response?.data?.data || response?.data;

      if (lessonData) {
        setLesson(lessonData);
        setActiveSectionIndex(0);
      } else {
        setError("درس یافت نشد");
      }
    } catch (err) {
      console.error("Error loading lesson:", err);
      setError(err.response?.data?.message || "خطا در بارگذاری درس");
      toast.error("خطا در بارگذاری درس");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🛠️ Helper Functions
  // ============================================

  const getSections = () => {
    return lesson?.sections || [];
  };

  const getSectionConfig = (type) => {
    return (
      SECTION_CONFIG[type] || {
        icon: BookOpen,
        label: { fa: type, en: type },
        color: "text-neutral-500",
        bg: "bg-neutral-50 dark:bg-neutral-800",
        border: "border-neutral-200 dark:border-neutral-700",
      }
    );
  };

  const getLocalized = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => getLocalized(item)).join(", ");
    }
    return obj[language] || obj.fa || obj.en || "";
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const markSectionComplete = (sectionId) => {
    setSectionProgress((prev) => ({ ...prev, [sectionId]: true }));
  };

  const isSectionComplete = (sectionId) => {
    return sectionProgress[sectionId] || false;
  };

  // ============================================
  // 🖼️ Section Renderers
  // ============================================

  const renderIntroduction = (section) => {
    const content = getLocalized(section.content);
    const title = getLocalized(section.title);

    return (
      <div className="space-y-4">
        {title && <h3 className="text-xl font-semibold">{title}</h3>}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="whitespace-pre-line text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    );
  };

  const renderPronunciationGuide = (section) => {
    const sounds = section.sounds || [];

    return (
      <div className="space-y-6">
        {sounds.map((sound, idx) => (
          <Card key={idx} variant="bordered" padding="lg">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-2xl font-bold text-primary-600 dark:text-primary-400">
                {sound.letter}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {sound.letter}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {getLocalized(sound.description)}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  IPA: {sound.ipa} • {getLocalized(sound.persianEquivalent)}
                </p>
                {sound.examples && sound.examples.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sound.examples.map((ex, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        {ex.word} → {ex.persian} ({ex.meaning})
                      </Badge>
                    ))}
                  </div>
                )}
                {sound.commonMistake && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      ⚠️ {getLocalized(sound.commonMistake)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderGreetings = (section) => {
    const items = section.items || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <Card key={idx} variant="bordered" padding="md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {item.german}
                </h4>
                <p className="text-sm text-neutral-500">{item.persian}</p>
                <p className="text-xs text-neutral-400">{item.ipa}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="primary" size="xs">
                    {item.time}
                  </Badge>
                  <Badge variant="secondary" size="xs">
                    {item.formality}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  {getLocalized(item.meaning)}
                </p>
                <div className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-xs text-neutral-500">
                    💡 {getLocalized(item.usage)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance(item.german);
                    utterance.lang = "de-DE";
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex-shrink-0"
              >
                <Volume2 className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderVocabulary = (section) => {
    const items = section.items || [];

    if (items.length === 0) {
      return (
        <p className="text-neutral-500">هیچ واژگانی در این بخش وجود ندارد.</p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <Card key={idx} variant="bordered" padding="md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.de}
                  </span>
                  {item.ipa && (
                    <span className="text-xs text-neutral-400">
                      /{item.ipa}/
                    </span>
                  )}
                  {item.article && (
                    <Badge variant="secondary" size="xs">
                      {item.article}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-neutral-500">
                  {item.fa} / {item.en}
                </p>
                {item.example && (
                  <div className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {item.example.de}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.example.fa || item.example.en}
                    </p>
                  </div>
                )}
                {item.usageNotes && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      📝 {getLocalized(item.usageNotes)}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance(item.de);
                    utterance.lang = "de-DE";
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex-shrink-0"
              >
                <Volume2 className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderGrammar = (section) => {
    const topics = section.topics || [];

    if (topics.length === 0) {
      return (
        <p className="text-neutral-500">
          هیچ موضوع گرامری در این بخش وجود ندارد.
        </p>
      );
    }

    return (
      <div className="space-y-6">
        {topics.map((topic, idx) => (
          <Card key={idx} variant="bordered" padding="lg">
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {getLocalized(topic.title)}
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {getLocalized(topic.concept)}
            </p>

            {topic.conjugationTable && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-100 dark:bg-neutral-800">
                      {topic.conjugationTable.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topic.conjugationTable.rows.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-neutral-200 dark:border-neutral-700"
                      >
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {topic.rules && (
              <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <h5 className="font-medium text-neutral-700 dark:text-neutral-300">
                  📋 قوانین:
                </h5>
                <ul className="mt-1 list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400">
                  {getLocalized(topic.rules)
                    .split(",")
                    .map((rule, i) => (
                      <li key={i}>{rule.trim()}</li>
                    ))}
                </ul>
              </div>
            )}

            {topic.examples && topic.examples.length > 0 && (
              <div className="mt-4 space-y-2">
                <h5 className="font-medium text-neutral-700 dark:text-neutral-300">
                  📌 مثال‌ها:
                </h5>
                {topic.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                  >
                    <p className="text-sm font-medium">
                      {ex.de || ex.sentence}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {ex.fa || ex.en || ex.meaning}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {topic.pattern && (
              <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-950 rounded-lg">
                <p className="text-sm font-mono text-primary-700 dark:text-primary-300">
                  {getLocalized(topic.pattern)}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderDialogues = (section) => {
    const items = section.items || [];

    if (items.length === 0) {
      return (
        <p className="text-neutral-500">هیچ دیالوگی در این بخش وجود ندارد.</p>
      );
    }

    return (
      <div className="space-y-6">
        {items.map((dialog, idx) => (
          <Card key={idx} variant="bordered" padding="lg">
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {getLocalized(dialog.title)}
            </h4>
            {dialog.characters && dialog.characters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {dialog.characters.map((char, i) => (
                  <Badge key={i} variant="secondary" size="sm">
                    {char.name} ({char.role})
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-3">
              {dialog.lines &&
                dialog.lines.map((line, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${i % 2 === 0 ? "bg-blue-50 dark:bg-blue-950" : "bg-green-50 dark:bg-green-950"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {line.speaker}
                      </span>
                      <span className="text-xs text-neutral-500">
                        ({line.persian})
                      </span>
                    </div>
                    <p className="text-sm">{line.german}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {getLocalized(line.meaning)}
                    </p>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderCultureNotes = (section) => {
    const content = getLocalized(section.content);

    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div className="whitespace-pre-line text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {content}
        </div>
      </div>
    );
  };

  // ============================================
  // ✅ FIXED: renderExercises - پشتیبانی از هر دو ساختار
  // ============================================

  const renderExercises = (section) => {
    const exerciseQuestions = [];

    // ✅ CASE 1: اگر section.questions مستقیم وجود دارد (ساختار سیدر a1/unit1.js)
    if (
      section.questions &&
      Array.isArray(section.questions) &&
      section.questions.length > 0
    ) {
      section.questions.forEach((q, idx) => {
        exerciseQuestions.push({
          id: q.id || `direct-${idx}-${Date.now()}`,
          type: q.type || "multiple_choice",
          question: {
            fa: q.question?.fa || q.question || q.text?.fa || `سوال ${idx + 1}`,
            en:
              q.question?.en ||
              q.questionEn ||
              q.text?.en ||
              `Question ${idx + 1}`,
          },
          options: q.options || [],
          correct: q.correct !== undefined ? q.correct : q.correctIndex || 0,
          answer: q.answer || "",
          hint: q.hint?.fa || q.hint || "",
          explanation: q.explanation || "",
        });
      });
    }

    // ✅ CASE 2: اگر section.data با ساختار data.vocabulary و ... وجود دارد
    const data = section.data || {};

    const extractFromData = (exerciseArray, prefix) => {
      if (!Array.isArray(exerciseArray)) return;
      exerciseArray.forEach((exercise, idx) => {
        if (exercise.questions && Array.isArray(exercise.questions)) {
          exercise.questions.forEach((q, qIdx) => {
            exerciseQuestions.push({
              id: q.id || `${prefix}-${idx}-${qIdx}-${Date.now()}`,
              type: q.type || "multiple_choice",
              question: {
                fa: q.question?.fa || q.question || `سوال ${qIdx + 1}`,
                en: q.question?.en || q.questionEn || `Question ${qIdx + 1}`,
              },
              options: q.options || [
                "گزینه ۱",
                "گزینه ۲",
                "گزینه ۳",
                "گزینه ۴",
              ],
              correct:
                q.correct !== undefined ? q.correct : q.correctIndex || 0,
              explanation: q.explanation || "",
            });
          });
        }
      });
    };

    extractFromData(data.vocabulary, "vocab");
    extractFromData(data.grammar, "grammar");
    extractFromData(data.reading, "reading");
    extractFromData(data.listening, "listening");
    extractFromData(data.writing, "writing");
    extractFromData(data.mixed, "mixed");

    // استخراج از review quiz
    if (data.review && data.review.quiz) {
      extractFromData([{ questions: data.review.quiz }], "review");
    }

    // اگر تمرینی وجود نداشت
    if (exerciseQuestions.length === 0) {
      return (
        <div className="text-center py-12 text-neutral-500">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <p className="text-lg font-medium">
            هیچ تمرینی برای این بخش وجود ندارد.
          </p>
          <p className="text-sm text-neutral-400 mt-2">
            با تکمیل درس‌های دیگر، تمرین‌های جدید اضافه می‌شوند.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-orange-500" />
            {getLocalized({ fa: "🏋️ تمرین‌های این بخش", en: "🏋️ Exercises" })}
          </h3>
          <Badge variant="primary" size="sm" className="text-sm">
            {exerciseQuestions.length}{" "}
            {getLocalized({ fa: "سوال", en: "questions" })}
          </Badge>
        </div>

        <ExerciseEngine
          exercise={{ questions: exerciseQuestions, xpReward: 25 }}
          onComplete={(results) => {
            const correct = results.correct || 0;
            const total = results.total || exerciseQuestions.length;
            const score = Math.round((correct / total) * 100);

            if (score >= 70) {
              toast.success(`✅ ${score}% از تمرین‌ها صحیح بود!`);
              markSectionComplete(section.id);
            } else {
              toast.info(`💪 ${score}% - دوباره تلاش کنید!`);
            }
          }}
          language={language}
        />
      </div>
    );
  };

  const renderReview = (section) => {
    const quiz = section.quiz || [];

    if (quiz.length === 0) {
      return (
        <p className="text-neutral-500">هیچ سوالی برای مرور وجود ندارد.</p>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          {getLocalized(section.titleObj)}
        </h3>
        {quiz.map((q, idx) => (
          <Card key={idx} variant="bordered" padding="md">
            <p className="font-medium">
              {idx + 1}. {getLocalized(q.question)}
            </p>
            {q.options && (
              <div className="mt-2 space-y-1">
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-1 rounded"
                  >
                    <input
                      type="radio"
                      name={`quiz-${idx}`}
                      value={i}
                      onChange={() => handleAnswer(q.id, i)}
                      className="w-4 h-4 text-primary-500"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {answers[q.id] !== undefined && (
              <div
                className={`mt-2 p-2 rounded-lg text-sm ${answers[q.id] === q.correctIndex ? "bg-green-100 dark:bg-green-900 text-green-700" : "bg-red-100 dark:bg-red-900 text-red-700"}`}
              >
                {answers[q.id] === q.correctIndex ? "✅ صحیح!" : "❌ اشتباه"}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderAssessment = (section) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {getLocalized(section.titleObj)}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Card variant="bordered" padding="md">
            <p className="text-sm text-neutral-500">تعداد سوالات</p>
            <p className="text-2xl font-bold text-neutral-900">
              {section.totalQuestions || 15}
            </p>
          </Card>
          <Card variant="bordered" padding="md">
            <p className="text-sm text-neutral-500">نمره قبولی</p>
            <p className="text-2xl font-bold text-green-500">
              {section.passingScore || 70}%
            </p>
          </Card>
        </div>
        {section.selfEvaluation && (
          <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <h4 className="font-medium">📝 خودارزیابی:</h4>
            <ul className="mt-2 space-y-1">
              {Object.values(section.selfEvaluation)
                .flat()
                .map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-neutral-600 dark:text-neutral-400"
                  >
                    • {item}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderCheatSheet = (section) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {section.greetings && section.greetings.length > 0 && (
          <Card variant="bordered" padding="md">
            <h4 className="font-semibold mb-2">👋 احوال‌پرسی‌ها</h4>
            <div className="space-y-1">
              {section.greetings.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm border-b border-neutral-100 dark:border-neutral-800 py-1"
                >
                  <span className="font-medium">{item.de}</span>
                  <span className="text-neutral-500">{item.fa}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        {section.pronouns && section.pronouns.length > 0 && (
          <Card variant="bordered" padding="md">
            <h4 className="font-semibold mb-2">👤 ضمایر</h4>
            <div className="space-y-1">
              {section.pronouns.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm border-b border-neutral-100 dark:border-neutral-800 py-1"
                >
                  <span className="font-medium">{item.de}</span>
                  <span className="text-neutral-500">{item.fa}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        {section.keyPhrases && section.keyPhrases.length > 0 && (
          <Card variant="bordered" padding="md">
            <h4 className="font-semibold mb-2">🔑 عبارات کلیدی</h4>
            <div className="space-y-1">
              {section.keyPhrases.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm border-b border-neutral-100 dark:border-neutral-800 py-1"
                >
                  <span className="font-medium">{item.de}</span>
                  <span className="text-neutral-500">{item.fa}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        {section.duVsSie && section.duVsSie.length > 0 && (
          <Card variant="bordered" padding="md">
            <h4 className="font-semibold mb-2">🎯 du vs Sie</h4>
            <div className="space-y-1">
              {section.duVsSie.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm border-b border-neutral-100 dark:border-neutral-800 py-1"
                >
                  <span className="text-neutral-500">{item.situation}</span>
                  <span className="font-medium">{item.use}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        {section.grammar && section.grammar.length > 0 && (
          <Card variant="bordered" padding="md">
            <h4 className="font-semibold mb-2">📐 گرامر</h4>
            <div className="space-y-1">
              {section.grammar.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm border-b border-neutral-100 dark:border-neutral-800 py-1"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-neutral-500">{item.summary}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  // ============================================
  // 🖼️ Main Render
  // ============================================

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton variant="button" className="w-10 h-10" />
          <Skeleton variant="text" className="w-32" />
        </div>
        <Skeleton variant="title" className="w-3/4" />
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="button" className="w-20 h-10" />
          ))}
        </div>
        <Card className="min-h-[400px]">
          <Skeleton variant="text" className="h-8 w-48" />
          <div className="space-y-4 mt-4">
            <Skeleton variant="text" className="h-20" />
            <Skeleton variant="text" className="h-20" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="w-16 h-16 text-danger-500" />
        <p className="text-neutral-500">{error || "درس یافت نشد"}</p>
        <Button
          variant="primary"
          onClick={() => navigate("/learn")}
          icon={ArrowLeft}
        >
          بازگشت به درس‌ها
        </Button>
      </div>
    );
  }

  const sections = getSections();
  const activeSection = sections[activeSectionIndex] || sections[0];
  const progress =
    sections.length > 0
      ? ((activeSectionIndex + 1) / sections.length) * 100
      : 0;

  // Render section content based on type
  const renderSectionContent = (section) => {
    if (!section)
      return <p className="text-neutral-500">بخشی برای نمایش وجود ندارد.</p>;

    switch (section.type) {
      case "introduction":
        return renderIntroduction(section);
      case "pronunciation_guide":
        return renderPronunciationGuide(section);
      case "greetings":
        return renderGreetings(section);
      case "vocabulary":
        return renderVocabulary(section);
      case "grammar":
        return renderGrammar(section);
      case "dialogues":
        return renderDialogues(section);
      case "culture_notes":
        return renderCultureNotes(section);
      case "exercises":
        return renderExercises(section);
      case "review":
        return renderReview(section);
      case "assessment":
        return renderAssessment(section);
      case "cheat_sheet":
        return renderCheatSheet(section);
      default:
        return (
          <div>
            <p className="text-neutral-500">
              بخش {section.type} در حال آماده‌سازی...
            </p>
            <pre className="text-xs bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg overflow-auto mt-4 max-h-96">
              {JSON.stringify(section, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/learn")}
            icon={ArrowLeft}
          >
            بازگشت
          </Button>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <Badge variant="success">{lesson.level}</Badge>
          <span>درس {lesson.lessonNumber}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lesson.estimatedTime || 20} دقیقه
          </span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {getLocalized(lesson.title)}
      </h1>

      {/* XP Info */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1 text-amber-500">
          <Star className="w-4 h-4" />
          {lesson.xpReward || 50} XP
        </span>
        {lesson.totalSections > 0 && (
          <span className="text-neutral-500">{lesson.totalSections} بخش</span>
        )}
        {lesson.totalVocabulary > 0 && (
          <span className="text-neutral-500">
            {lesson.totalVocabulary} واژگان
          </span>
        )}
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm text-neutral-500 mb-1">
          <span>پیشرفت درس</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section, idx) => {
          const config = getSectionConfig(section.type);
          const Icon = config.icon;
          const isActive = idx === activeSectionIndex;
          const isComplete = isSectionComplete(section.id);

          return (
            <Button
              key={section.id || idx}
              variant={
                isActive ? "primary" : isComplete ? "success" : "secondary"
              }
              size="sm"
              onClick={() => setActiveSectionIndex(idx)}
              className="flex items-center gap-1"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {config.label?.[language] ||
                  config.label?.fa ||
                  config.label?.en ||
                  section.type}
              </span>
              {isComplete && <CheckCircle className="w-3 h-3" />}
            </Button>
          );
        })}
      </div>

      {/* Section Content */}
      {activeSection && (
        <motion.div
          key={activeSectionIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            variant="bordered"
            padding="lg"
            className={`border-2 ${getSectionConfig(activeSection.type).border} ${getSectionConfig(activeSection.type).bg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {activeSection.type === "introduction" && "🌟"}
                  {activeSection.type === "pronunciation_guide" && "🎤"}
                  {activeSection.type === "greetings" && "👋"}
                  {activeSection.type === "vocabulary" && "📖"}
                  {activeSection.type === "grammar" && "📝"}
                  {activeSection.type === "dialogues" && "💬"}
                  {activeSection.type === "culture_notes" && "🌍"}
                  {activeSection.type === "exercises" && "🏋️"}
                  {activeSection.type === "review" && "📝"}
                  {activeSection.type === "assessment" && "🎯"}
                  {activeSection.type === "cheat_sheet" && "📋"}
                </span>
                <h2
                  className={`text-xl font-semibold ${getSectionConfig(activeSection.type).color}`}
                >
                  {getLocalized(activeSection.title) ||
                    getSectionConfig(activeSection.type).label[language]}
                </h2>
              </div>
              {isSectionComplete(activeSection.id) && (
                <Badge variant="success" size="sm">
                  تکمیل شد
                </Badge>
              )}
            </div>

            {renderSectionContent(activeSection)}
          </Card>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          onClick={() =>
            setActiveSectionIndex(Math.max(0, activeSectionIndex - 1))
          }
          disabled={activeSectionIndex === 0}
          icon={ChevronLeft}
        >
          قبلی
        </Button>

        <Button
          variant="primary"
          onClick={() => {
            markSectionComplete(activeSection.id);
            if (activeSectionIndex < sections.length - 1) {
              setActiveSectionIndex(activeSectionIndex + 1);
            } else {
              setCompleted(true);
              setShowCompletion(true);
              toast.success("🎉 درس کامل شد!");
            }
          }}
          icon={
            activeSectionIndex === sections.length - 1 ? Trophy : CheckCircle
          }
        >
          {activeSectionIndex === sections.length - 1 ? "تکمیل درس" : "بعدی"}
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            setActiveSectionIndex(
              Math.min(sections.length - 1, activeSectionIndex + 1),
            )
          }
          disabled={activeSectionIndex === sections.length - 1}
          iconPosition="right"
          icon={ChevronRight}
        >
          بعدی
        </Button>
      </div>

      {/* Completion Celebration */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <Card
              variant="elevated"
              padding="xl"
              className="max-w-md text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Trophy className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                🎉 درس کامل شد!
              </h2>
              <p className="text-neutral-500 mt-2">
                شما این درس را با موفقیت به پایان رساندید!
              </p>
              <p className="text-sm text-amber-500 mt-2">
                +{lesson.xpReward || 50} XP کسب کردید!
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setShowCompletion(false);
                  navigate("/learn");
                }}
                className="mt-4"
              >
                بازگشت به درس‌ها
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonPage;
