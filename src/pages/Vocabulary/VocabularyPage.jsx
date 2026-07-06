/**
 * VocabularyPage.jsx
 * Path: src/pages/Vocabulary/VocabularyPage.jsx
 * Description: Vocabulary practice with flashcards
 * Changes:
 * - ✅ FIXED: Syntax error - import debug moved outside import block
 * - ✅ Better error handling with retry
 * - ✅ Skeleton loading state
 * - ✅ Progress tracking in localStorage
 * - ✅ Keyboard shortcuts (Space, Arrow Keys)
 * - ✅ Improved UX with statistics
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import api from "@services/api";
import debug from "../../utils/debug";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Volume2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";

const VocabularyPage = () => {
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState([]);
  const [unknownWords, setUnknownWords] = useState([]);
  const [stats, setStats] = useState({ total: 0, known: 0, unknown: 0 });
  const [retryCount, setRetryCount] = useState(0);

  const containerRef = useRef(null);

  // ============================================
  // 📥 Load Words
  // ============================================

  const loadWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let wordsData = [];

      try {
        const response = await api.get("/vocabulary/words");
        if (response?.data?.data && Array.isArray(response.data.data)) {
          wordsData = response.data.data;
        } else if (Array.isArray(response)) {
          wordsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          wordsData = response.data;
        }
      } catch (e) {
        debug.warn("⚠️ API failed, using fallback data");
        wordsData = getFallbackWords();
      }

      // اگر دیتا خالی بود، از داده‌های نمونه استفاده کن
      if (wordsData.length === 0) {
        wordsData = getFallbackWords();
        toast.info(
          language === "fa"
            ? "📚 از داده‌های نمونه استفاده می‌شود"
            : "📚 Using sample data",
        );
      }

      // اضافه کردن ایموجی و فرمت‌دهی
      wordsData = wordsData.map((word) => ({
        ...word,
        emoji: getWordEmoji(word.category || word.topic),
        id: word.id || word._id || `word-${Math.random()}`,
      }));

      setWords(wordsData);
      setStats({
        total: wordsData.length,
        known: 0,
        unknown: 0,
      });

      // بارگذاری پیشرفت ذخیره شده
      loadProgress(wordsData);

      setRetryCount(0);
    } catch (error) {
      debug.error("❌ Error loading words:", error);
      setError(error.message || "خطا در بارگذاری لغات");
      // استفاده از داده‌های نمونه در صورت خطا
      const fallback = getFallbackWords();
      setWords(
        fallback.map((w, i) => ({
          ...w,
          id: `word-${i}`,
          emoji: getWordEmoji(w.category),
        })),
      );
      toast.error(
        language === "fa" ? "خطا در بارگذاری لغات" : "Error loading words",
      );
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  // ============================================
  // 💾 Progress Tracking
  // ============================================

  const loadProgress = (wordsData) => {
    const saved = localStorage.getItem(
      `vocabulary_progress_${user?.id || "guest"}`,
    );
    if (saved) {
      try {
        const { known, unknown, currentIndex: savedIndex } = JSON.parse(saved);
        setKnownWords(known || []);
        setUnknownWords(unknown || []);
        if (savedIndex !== undefined && savedIndex < wordsData.length) {
          setCurrentIndex(savedIndex);
        }
        setStats({
          total: wordsData.length,
          known: known?.length || 0,
          unknown: unknown?.length || 0,
        });
      } catch (e) {
        debug.warn("⚠️ Error loading progress:", e);
      }
    }
  };

  const saveProgress = useCallback(() => {
    if (words.length === 0) return;
    try {
      localStorage.setItem(
        `vocabulary_progress_${user?.id || "guest"}`,
        JSON.stringify({
          known: knownWords,
          unknown: unknownWords,
          currentIndex,
        }),
      );
    } catch (e) {
      // silent fail
    }
  }, [words.length, knownWords, unknownWords, currentIndex, user?.id]);

  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  // ============================================
  // 🛠️ Helper Functions
  // ============================================

  const getFallbackWords = () => {
    return [
      {
        id: 1,
        de: "Hallo",
        fa: "سلام",
        en: "Hello",
        emoji: "👋",
        pronunciation: "hɑˈloː",
        level: "A1",
        category: "greetings",
        example: "Hallo, wie geht es dir?",
        exampleFa: "سلام، حالت چطور است؟",
      },
      {
        id: 2,
        de: "Tschüss",
        fa: "خداحافظ",
        en: "Goodbye",
        emoji: "👋",
        pronunciation: "tʃʏs",
        level: "A1",
        category: "greetings",
        example: "Tschüss, bis morgen!",
        exampleFa: "خداحافظ، تا فردا!",
      },
      {
        id: 3,
        de: "Danke",
        fa: "متشکرم",
        en: "Thank you",
        emoji: "🙏",
        pronunciation: "ˈdaŋkə",
        level: "A1",
        category: "greetings",
        example: "Danke für deine Hilfe!",
        exampleFa: "متشکرم از کمکت!",
      },
      {
        id: 4,
        de: "Bitte",
        fa: "خواهش می‌کنم",
        en: "Please",
        emoji: "🤲",
        pronunciation: "ˈbɪtə",
        level: "A1",
        category: "greetings",
        example: "Bitte schön!",
        exampleFa: "خواهش می‌کنم!",
      },
      {
        id: 5,
        de: "Ja",
        fa: "بله",
        en: "Yes",
        emoji: "👍",
        pronunciation: "jaː",
        level: "A1",
        category: "greetings",
      },
      {
        id: 6,
        de: "Nein",
        fa: "نه",
        en: "No",
        emoji: "👎",
        pronunciation: "naɪn",
        level: "A1",
        category: "greetings",
      },
      {
        id: 7,
        de: "Haus",
        fa: "خانه",
        en: "House",
        emoji: "🏠",
        pronunciation: "haʊs",
        level: "A1",
        category: "housing",
        example: "Das Haus ist groß.",
        exampleFa: "خانه بزرگ است.",
      },
      {
        id: 8,
        de: "Auto",
        fa: "ماشین",
        en: "Car",
        emoji: "🚗",
        pronunciation: "ˈaʊto",
        level: "A1",
        category: "transport",
        example: "Ich fahre mit dem Auto.",
        exampleFa: "من با ماشین می‌روم.",
      },
      {
        id: 9,
        de: "Wasser",
        fa: "آب",
        en: "Water",
        emoji: "💧",
        pronunciation: "ˈvasɐ",
        level: "A1",
        category: "food",
        example: "Ich trinke Wasser.",
        exampleFa: "من آب می‌نوشم.",
      },
      {
        id: 10,
        de: "Brot",
        fa: "نان",
        en: "Bread",
        emoji: "🍞",
        pronunciation: "bʁoːt",
        level: "A1",
        category: "food",
        example: "Ich esse Brot.",
        exampleFa: "من نان می‌خورم.",
      },
    ];
  };

  const getWordEmoji = (category) => {
    const emojiMap = {
      greetings: "👋",
      food: "🍽️",
      drinks: "🥤",
      family: "👨‍👩‍👧",
      transport: "🚗",
      housing: "🏠",
      work: "💼",
      education: "📚",
      health: "🏥",
      shopping: "🛒",
      adjectives: "🎨",
      animals: "🐕",
      nature: "🌿",
      weather: "🌤️",
      colors: "🌈",
      numbers: "🔢",
      time: "⏰",
      people: "👤",
      travel: "✈️",
      sports: "⚽",
      music: "🎵",
      art: "🎭",
      technology: "💻",
      business: "📊",
    };
    return emojiMap[category] || "📚";
  };

  const speakWord = (word) => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "de-DE";
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ============================================
  // 🎮 Actions
  // ============================================

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnow = () => {
    const word = words[currentIndex];
    if (!word) return;

    setKnownWords((prev) => {
      const newKnown = [...prev, word.id];
      setStats((s) => ({ ...s, known: s.known + 1 }));
      return newKnown;
    });
    setUnknownWords((prev) => prev.filter((id) => id !== word.id));
    toast.success("✅ لغت را می‌دانید!");
    handleNext();
  };

  const handleDontKnow = () => {
    const word = words[currentIndex];
    if (!word) return;

    setUnknownWords((prev) => {
      const newUnknown = [...prev, word.id];
      setStats((s) => ({ ...s, unknown: s.unknown + 1 }));
      return newUnknown;
    });
    toast.info("📖 لغت را مرور کنید");
    handleNext();
  };

  const shuffleWords = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success("🔀 لغات به هم ریخته شدند!");
  };

  const resetProgress = () => {
    setKnownWords([]);
    setUnknownWords([]);
    setStats({ total: words.length, known: 0, unknown: 0 });
    setCurrentIndex(0);
    setIsFlipped(false);
    localStorage.removeItem(`vocabulary_progress_${user?.id || "guest"}`);
    toast.info("🔄 پیشرفت ریست شد");
  };

  const retryLoad = () => {
    setRetryCount((prev) => prev + 1);
    loadWords();
  };

  // ============================================
  // ⌨️ Keyboard Shortcuts
  // ============================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case " ":
          e.preventDefault();
          handleFlip();
          break;
        case "k":
        case "K":
          e.preventDefault();
          handleKnow();
          break;
        case "d":
        case "D":
          e.preventDefault();
          handleDontKnow();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, words.length]);

  // ============================================
  // 🖼️ Render
  // ============================================

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg mt-2 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
        </div>
        <div className="w-full max-w-md mx-auto h-[340px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
        <div className="flex items-center justify-between gap-4 mt-8">
          <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500">
          {language === "fa"
            ? "هیچ لغتی برای مرور وجود ندارد"
            : "No words to review"}
        </p>
        {error && (
          <button
            onClick={retryLoad}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            {language === "fa" ? "تلاش مجدد" : "Retry"}
          </button>
        )}
      </div>
    );
  }

  const currentWord = words[currentIndex] || words[0];
  const progress = ((currentIndex + 1) / words.length) * 100;
  const masteredCount = knownWords.length;
  const remainingCount = words.length - knownWords.length - unknownWords.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-500" />
            {language === "fa" ? "📖 تمرین لغات" : "Vocabulary Practice"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {language === "fa"
              ? `${words.length} لغت برای مرور`
              : `${words.length} words to review`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={shuffleWords}
            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <button
            onClick={resetProgress}
            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1 text-green-500">
          <CheckCircle className="w-4 h-4" />
          <span>
            {knownWords.length} {language === "fa" ? "یاد گرفته" : "learned"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-red-500">
          <XCircle className="w-4 h-4" />
          <span>
            {unknownWords.length}{" "}
            {language === "fa" ? "نیاز به مرور" : "needs review"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-neutral-400">
          <Sparkles className="w-4 h-4" />
          <span>
            {remainingCount} {language === "fa" ? "باقی‌مانده" : "remaining"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <Trophy className="w-4 h-4" />
          <span>{Math.round((knownWords.length / words.length) * 100)}%</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-neutral-500 mb-1">
          <span>{language === "fa" ? "پیشرفت" : "Progress"}</span>
          <span>
            {currentIndex + 1} / {words.length}
          </span>
        </div>
        <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={retryLoad}
            className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 transition"
          >
            {language === "fa" ? "تلاش مجدد" : "Retry"}
          </button>
        </motion.div>
      )}

      {/* Flashcard */}
      <div className="mb-8">
        <div className="relative w-full max-w-md mx-auto">
          <div
            className="relative w-full transition-transform duration-500"
            style={{ perspective: "1000px", height: "340px" }}
          >
            <motion.div
              className="w-full h-full"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
              style={{ transformStyle: "preserve-3d", position: "relative" }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl shadow-xl"
                style={{
                  backfaceVisibility: "hidden",
                  backgroundColor: "#ffffff",
                  border: "2px solid #e5e7eb",
                }}
              >
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs text-white ${getLevelColor(currentWord.level)}`}
                    >
                      {currentWord.level || "A1"}
                    </span>
                  </div>
                  <div className="text-7xl mb-4">
                    {currentWord.emoji || "📚"}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentWord.de || currentWord.word}
                  </h3>
                  {currentWord.pronunciation && (
                    <p className="text-sm text-gray-400 mb-1">
                      /{currentWord.pronunciation}/
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    👆 {isFlipped ? "برگشت" : "کلیک کنید تا ترجمه را ببینید"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ⌨️ Space: برگرداندن | ← →: حرکت
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentWord.de || currentWord.word);
                    }}
                    className="absolute bottom-4 left-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <Volume2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlip();
                    }}
                    className="absolute bottom-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Back Side */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl shadow-xl"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  backgroundColor: "#f8fafc",
                  border: "2px solid #e5e7eb",
                }}
              >
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">🇩🇪 → 🌍</p>
                    <h3 className="text-2xl font-bold text-primary-600">
                      {currentWord.fa || currentWord.translation}
                    </h3>
                    {currentWord.en && (
                      <p className="text-sm text-gray-400 mt-1">
                        ({currentWord.en})
                      </p>
                    )}
                  </div>
                  {currentWord.example && (
                    <div className="w-full mt-2">
                      <p className="text-xs text-gray-400 mb-1">📝 مثال:</p>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-800">
                          {currentWord.example}
                        </p>
                        {currentWord.exampleFa && (
                          <p className="text-xs text-gray-500 mt-1">
                            {currentWord.exampleFa}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    👆 کلیک کنید تا برگردد
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlip();
                    }}
                    className="absolute bottom-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          {language === "fa" ? "قبلی" : "Previous"}
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleDontKnow}
            className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            {language === "fa" ? "❌ نمی‌دانم" : "Don't Know"}
          </button>
          <button
            onClick={handleKnow}
            className="px-6 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
          >
            {language === "fa" ? "✅ می‌دانم" : "Know"}
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {language === "fa" ? "بعدی" : "Next"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Completion */}
      {currentIndex === words.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 text-center"
        >
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="font-medium text-green-700 dark:text-green-300">
            {language === "fa"
              ? "🎉 همه لغات را مرور کردید! عالی بود!"
              : "🎉 You reviewed all words! Great job!"}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {knownWords.length}{" "}
            {language === "fa" ? "لغت را می‌دانید" : "words known"} •
            {unknownWords.length}{" "}
            {language === "fa" ? "لغت نیاز به مرور دارد" : "need review"}
          </p>
          <button
            onClick={shuffleWords}
            className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            {language === "fa" ? "🔄 مرور مجدد" : "🔄 Review Again"}
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Helper function for level colors
const getLevelColor = (level) => {
  const colors = {
    A1: "bg-green-500",
    A2: "bg-blue-500",
    B1: "bg-yellow-500",
    B2: "bg-orange-500",
    C1: "bg-red-500",
    C2: "bg-purple-500",
  };
  return colors[level] || "bg-gray-500";
};

export default VocabularyPage;
