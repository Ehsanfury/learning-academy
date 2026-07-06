/**
 * PracticeDetailPage.jsx
 * Path: src/pages/Practice/PracticeDetailPage.jsx
 * Description: Practice detail page for each exercise type
 * Changes:
 * - ✅ FIXED: Removed toast.info (replaced with toast.success)
 * - ✅ FIXED: Better error handling
 * - ✅ FIXED: Sample questions generator
 * - ✅ FIXED: API integration
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import { exerciseApi } from "@services/exerciseApi";
import ExerciseEngine from "@components/exercise/ExerciseEngine";
import Button from "@components/ui/Button";
import Card from "@components/ui/Card";
import Badge from "@components/ui/Badge";
import Skeleton from "@components/ui/Skeleton";
import { ArrowLeft, Loader2, AlertCircle, Dumbbell } from "lucide-react";
import toast from "react-hot-toast";

// ============================================
// 📊 Sample Questions Generator
// ============================================

const getSampleQuestions = (type, count = 5) => {
  const samples = {
    vocabulary: [
      {
        id: "voc-1",
        type: "multiple_choice",
        question: {
          fa: "معنی کلمه 'Hallo' چیست؟",
          en: "What does 'Hallo' mean?",
        },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 0,
        explanation: {
          fa: "'Hallo' به معنی سلام است.",
          en: "'Hallo' means hello.",
        },
      },
      {
        id: "voc-2",
        type: "multiple_choice",
        question: {
          fa: "معنی کلمه 'Tschüss' چیست؟",
          en: "What does 'Tschüss' mean?",
        },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 1,
        explanation: {
          fa: "'Tschüss' به معنی خداحافظ است.",
          en: "'Tschüss' means goodbye.",
        },
      },
      {
        id: "voc-3",
        type: "multiple_choice",
        question: {
          fa: "معنی کلمه 'Danke' چیست؟",
          en: "What does 'Danke' mean?",
        },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 2,
        explanation: {
          fa: "'Danke' به معنی متشکرم است.",
          en: "'Danke' means thank you.",
        },
      },
      {
        id: "voc-4",
        type: "multiple_choice",
        question: {
          fa: "معنی کلمه 'Bitte' چیست؟",
          en: "What does 'Bitte' mean?",
        },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 3,
        explanation: {
          fa: "'Bitte' به معنی خواهش می‌کنم است.",
          en: "'Bitte' means please / you're welcome.",
        },
      },
      {
        id: "voc-5",
        type: "multiple_choice",
        question: {
          fa: "معنی کلمه 'Ja' چیست؟",
          en: "What does 'Ja' mean?",
        },
        options: ["بله", "خیر", "شاید", "نه"],
        correct: 0,
        explanation: {
          fa: "'Ja' به معنی بله است.",
          en: "'Ja' means yes.",
        },
      },
    ],
    grammar: [
      {
        id: "gram-1",
        type: "multiple_choice",
        question: {
          fa: "حرف تعریف مناسب برای 'Mann' چیست؟",
          en: "What is the correct article for 'Mann'?",
        },
        options: ["der", "die", "das", "den"],
        correct: 0,
        explanation: {
          fa: "'Mann' مذکر است و 'der' می‌گیرد.",
          en: "'Mann' is masculine and takes 'der'.",
        },
      },
      {
        id: "gram-2",
        type: "multiple_choice",
        question: {
          fa: "حرف تعریف مناسب برای 'Frau' چیست؟",
          en: "What is the correct article for 'Frau'?",
        },
        options: ["der", "die", "das", "den"],
        correct: 1,
        explanation: {
          fa: "'Frau' مؤنث است و 'die' می‌گیرد.",
          en: "'Frau' is feminine and takes 'die'.",
        },
      },
      {
        id: "gram-3",
        type: "multiple_choice",
        question: {
          fa: "حرف تعریف مناسب برای 'Kind' چیست؟",
          en: "What is the correct article for 'Kind'?",
        },
        options: ["der", "die", "das", "den"],
        correct: 2,
        explanation: {
          fa: "'Kind' خنثی است و 'das' می‌گیرد.",
          en: "'Kind' is neuter and takes 'das'.",
        },
      },
      {
        id: "gram-4",
        type: "multiple_choice",
        question: {
          fa: "فعل 'heißen' در 'ich' چگونه صرف می‌شود؟",
          en: "How is 'heißen' conjugated for 'ich'?",
        },
        options: ["heiße", "heißt", "heißen", "heiß"],
        correct: 0,
        explanation: {
          fa: "برای 'ich'، 'heißen' به 'heiße' تبدیل می‌شود.",
          en: "For 'ich', 'heißen' becomes 'heiße'.",
        },
      },
      {
        id: "gram-5",
        type: "multiple_choice",
        question: {
          fa: "فعل 'sein' در 'ich' چگونه صرف می‌شود؟",
          en: "How is 'sein' conjugated for 'ich'?",
        },
        options: ["bin", "bist", "ist", "sind"],
        correct: 0,
        explanation: {
          fa: "برای 'ich'، 'sein' به 'bin' تبدیل می‌شود.",
          en: "For 'ich', 'sein' becomes 'bin'.",
        },
      },
    ],
    listening: [
      {
        id: "list-1",
        type: "multiple_choice",
        question: {
          fa: "در مکالمه چه گفته شد؟",
          en: "What was said in the conversation?",
        },
        options: ["Hallo", "Tschüss", "Danke", "Bitte"],
        correct: 0,
        explanation: {
          fa: "در ابتدای مکالمه 'Hallo' گفته شد.",
          en: "'Hallo' was said at the beginning of the conversation.",
        },
      },
      {
        id: "list-2",
        type: "multiple_choice",
        question: {
          fa: "گزینه مناسب برای خداحافظی چیست؟",
          en: "What is the appropriate goodbye?",
        },
        options: ["Hallo", "Tschüss", "Danke", "Bitte"],
        correct: 1,
        explanation: {
          fa: "'Tschüss' برای خداحافظی استفاده می‌شود.",
          en: "'Tschüss' is used for goodbye.",
        },
      },
    ],
    reading: [
      {
        id: "read-1",
        type: "multiple_choice",
        question: {
          fa: "متن درباره چیست؟",
          en: "What is the text about?",
        },
        options: ["سلام و احوالپرسی", "خرید", "سفر", "غذا"],
        correct: 0,
        explanation: {
          fa: "متن درباره معرفی خود و سلام است.",
          en: "The text is about introductions and greetings.",
        },
      },
      {
        id: "read-2",
        type: "multiple_choice",
        question: {
          fa: "شخص اصلی متن چه نام دارد؟",
          en: "What is the main character's name?",
        },
        options: ["Anna", "Maria", "Lisa", "Sarah"],
        correct: 0,
        explanation: {
          fa: "شخص اصلی 'Anna' نام دارد.",
          en: "The main character is named 'Anna'.",
        },
      },
    ],
    writing: [
      {
        id: "write-1",
        type: "fill_in",
        question: {
          fa: "جمله را کامل کنید: Ich ___ Nina.",
          en: "Complete the sentence: Ich ___ Nina.",
        },
        options: ["heiße", "heißt", "heißen", "heiß"],
        correct: 0,
        explanation: {
          fa: "برای 'ich' از 'heiße' استفاده می‌شود.",
          en: "'heiße' is used for 'ich'.",
        },
      },
      {
        id: "write-2",
        type: "fill_in",
        question: {
          fa: "جمله را کامل کنید: ___ Name ist Anna.",
          en: "Complete the sentence: ___ Name ist Anna.",
        },
        options: ["Mein", "Dein", "Ihr", "Sein"],
        correct: 0,
        explanation: {
          fa: "'Mein' به معنی 'مال من' است.",
          en: "'Mein' means 'my'.",
        },
      },
    ],
    mixed: [
      {
        id: "mix-1",
        type: "multiple_choice",
        question: {
          fa: "معنی کلمه 'Danke' چیست؟",
          en: "What does 'Danke' mean?",
        },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 2,
        explanation: {
          fa: "'Danke' به معنی متشکرم است.",
          en: "'Danke' means thank you.",
        },
      },
      {
        id: "mix-2",
        type: "multiple_choice",
        question: {
          fa: "حرف تعریف مناسب برای 'Kind' چیست؟",
          en: "What is the correct article for 'Kind'?",
        },
        options: ["der", "die", "das", "den"],
        correct: 2,
        explanation: {
          fa: "'Kind' خنثی است و 'das' می‌گیرد.",
          en: "'Kind' is neuter and takes 'das'.",
        },
      },
      {
        id: "mix-3",
        type: "fill_in",
        question: {
          fa: "جمله را کامل کنید: Ich ___ Nina.",
          en: "Complete the sentence: Ich ___ Nina.",
        },
        options: ["heiße", "heißt", "heißen", "heiß"],
        correct: 0,
        explanation: {
          fa: "برای 'ich' از 'heiße' استفاده می‌شود.",
          en: "'heiße' is used for 'ich'.",
        },
      },
      {
        id: "mix-4",
        type: "multiple_choice",
        question: {
          fa: "معنی کلمه 'Hallo' چیست؟",
          en: "What does 'Hallo' mean?",
        },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 0,
        explanation: {
          fa: "'Hallo' به معنی سلام است.",
          en: "'Hallo' means hello.",
        },
      },
    ],
  };

  const sampleQuestions = samples[type] || samples.mixed;

  // اگر تعداد درخواستی بیشتر از نمونه‌هاست، تکرار کن
  let result = [];
  while (result.length < count) {
    result = [...result, ...sampleQuestions];
  }

  return result.slice(0, count);
};

// ============================================
// 📊 Skeleton Component
// ============================================

const PracticeDetailSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 py-8">
    <Skeleton variant="button" className="w-32 h-10 mb-6" />
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton variant="title" className="w-48" />
          <Skeleton variant="text" className="w-32 mt-2" />
        </div>
        <Skeleton variant="button" className="w-24 h-8" />
      </div>
      <div className="space-y-4">
        <Skeleton variant="bar" className="h-2" />
        <Skeleton variant="card" className="h-32" />
        <div className="flex justify-between">
          <Skeleton variant="button" className="w-24 h-10" />
          <Skeleton variant="button" className="w-24 h-10" />
        </div>
      </div>
    </Card>
  </div>
);

// ============================================
// 📊 PracticeDetailPage Component
// ============================================

const PracticeDetailPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [exerciseId, setExerciseId] = useState(null);
  const [exerciseTitle, setExerciseTitle] = useState({});

  // ============================================
  // 📥 Load Exercise
  // ============================================

  useEffect(() => {
    loadExercise();
  }, [type]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      setError(null);

      const typeLabels = {
        vocabulary: { fa: "تمرین واژگان", en: "Vocabulary Exercise" },
        grammar: { fa: "تمرین گرامر", en: "Grammar Exercise" },
        listening: { fa: "تمرین شنیداری", en: "Listening Exercise" },
        reading: { fa: "تمرین خواندن", en: "Reading Exercise" },
        writing: { fa: "تمرین نوشتاری", en: "Writing Exercise" },
        mixed: { fa: "تمرین ترکیبی", en: "Mixed Exercise" },
      };

      setExerciseTitle(typeLabels[type] || typeLabels.mixed);

      // تلاش برای دریافت از API
      try {
        const response = await exerciseApi.generateExercise({
          type: type || "mixed",
          level: "A1",
          count: 5,
        });

        if (response?.success && response?.data?.questions?.length > 0) {
          setQuestions(response.data.questions);
          setExerciseId(response.data.id || `exercise-${Date.now()}`);
          return;
        }
      } catch (apiError) {
        console.log("API error, using sample questions:", apiError.message);
        // ادامه به نمونه‌ها
      }

      // استفاده از نمونه‌ها
      const sampleQuestions = getSampleQuestions(type, 5);
      setQuestions(sampleQuestions);
      setExerciseId(`sample-${Date.now()}`);

      // ✅ FIXED: استفاده از toast به جای toast.info
      toast.success("از داده‌های نمونه استفاده می‌شود");
    } catch (error) {
      console.error("Error loading exercise:", error);
      setError(error.message || "خطا در بارگذاری تمرین");

      // Fallback به داده‌های نمونه
      const sampleQuestions = getSampleQuestions(type, 5);
      setQuestions(sampleQuestions);
      setExerciseId(`sample-${Date.now()}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🛠️ Helper Functions
  // ============================================

  const handleSubmit = (answers) => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    const earnedXP = Math.round((score / 100) * 50);

    toast.success(`✅ ${score}% - ${earnedXP} XP کسب کردید!`);
  };

  const getTypeLabel = () => {
    const labels = {
      vocabulary: { fa: "واژگان", en: "Vocabulary" },
      grammar: { fa: "گرامر", en: "Grammar" },
      listening: { fa: "شنیداری", en: "Listening" },
      reading: { fa: "خواندن", en: "Reading" },
      writing: { fa: "نوشتاری", en: "Writing" },
      mixed: { fa: "ترکیبی", en: "Mixed" },
    };
    return labels[type] || labels.mixed;
  };

  const getTypeEmoji = () => {
    const emojis = {
      vocabulary: "📚",
      grammar: "📝",
      listening: "🎧",
      reading: "📖",
      writing: "✍️",
      mixed: "🎯",
    };
    return emojis[type] || "🏋️";
  };

  const getTypeColor = () => {
    const colors = {
      vocabulary: "text-blue-500",
      grammar: "text-purple-500",
      listening: "text-green-500",
      reading: "text-teal-500",
      writing: "text-pink-500",
      mixed: "text-amber-500",
    };
    return colors[type] || "text-primary-500";
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  if (loading) {
    return <PracticeDetailSkeleton />;
  }

  if (error && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-danger-500" />
        <p className="text-neutral-500">{error}</p>
        <Button variant="primary" onClick={loadExercise}>
          {language === "fa" ? "تلاش مجدد" : "Retry"}
        </Button>
      </div>
    );
  }

  const typeLabel = getTypeLabel();
  const typeEmoji = getTypeEmoji();
  const typeColor = getTypeColor();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/practice")}
        icon={ArrowLeft}
        className="mb-6"
      >
        {language === "fa" ? "بازگشت به تمرین‌ها" : "Back to Practice"}
      </Button>

      {/* Main Card */}
      <Card variant="elevated" padding="lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span className={typeColor}>{typeEmoji}</span>
              {exerciseTitle?.[language] || exerciseTitle || "تمرین"}
            </h1>
            <p className="text-sm text-neutral-500">
              {language === "fa"
                ? `${questions.length} سوال • ${typeLabel[language]}`
                : `${questions.length} questions • ${typeLabel[language]}`}
            </p>
          </div>
          <Badge variant="primary" size="lg">
            {typeLabel[language]}
          </Badge>
        </div>

        {/* Exercise Engine */}
        <ExerciseEngine
          questions={questions}
          onComplete={handleSubmit}
          language={language}
        />

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 text-center">
            {language === "fa"
              ? "💡 برای هر سوال یک پاسخ را انتخاب کنید و سپس دکمه ارسال را بزنید."
              : "💡 Select one answer for each question and then click Submit."}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PracticeDetailPage;
