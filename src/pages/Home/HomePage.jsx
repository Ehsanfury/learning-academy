/**
 * ExercisePage.jsx
 * Path: src/pages/Exercise/ExercisePage.jsx
 * Description: Exercise page with Exercise Engine
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import { exerciseApi } from "@services/exerciseApi";
import ExerciseEngine from "@components/exercise/ExerciseEngine";
import Button from "@components/ui/Button";
import Card from "@components/ui/Card";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const ExercisePage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [exerciseId, setExerciseId] = useState(null);

  useEffect(() => {
    loadExercise();
  }, [type]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      setError(null);

      // دریافت تمرین‌های نمونه
      const response = await exerciseApi.generateExercise({
        type: type || "mixed",
        level: "A1",
        count: 5,
      });

      if (response.success) {
        const exerciseData = response.data;
        setQuestions(exerciseData.questions || []);
        setExerciseId(exerciseData.id || `exercise-${Date.now()}`);
      } else {
        // اگر API کار نکرد، از داده‌های نمونه استفاده کن
        const sampleQuestions = getSampleQuestions(type);
        setQuestions(sampleQuestions);
        setExerciseId(`sample-${Date.now()}`);
        toast.info("از داده‌های نمونه استفاده می‌شود");
      }
    } catch (error) {
      console.error("Error loading exercise:", error);
      setError(error.message || "خطا در بارگذاری تمرین");

      // Fallback به داده‌های نمونه
      const sampleQuestions = getSampleQuestions(type);
      setQuestions(sampleQuestions);
      setExerciseId(`sample-${Date.now()}`);
      toast.info("از داده‌های نمونه استفاده می‌شود");
    } finally {
      setLoading(false);
    }
  };

  const getSampleQuestions = (type) => {
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
        },
      ],
      grammar: [
        {
          id: "gram-1",
          type: "multiple_choice",
          question: {
            fa: "حرف تعریف مناسب برای 'Mann' چیست؟",
            en: "What is the article for 'Mann'?",
          },
          options: ["der", "die", "das", "den"],
          correct: 0,
        },
        {
          id: "gram-2",
          type: "multiple_choice",
          question: {
            fa: "حرف تعریف مناسب برای 'Frau' چیست؟",
            en: "What is the article for 'Frau'?",
          },
          options: ["der", "die", "das", "den"],
          correct: 1,
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
        },
      ],
      reading: [
        {
          id: "read-1",
          type: "multiple_choice",
          question: { fa: "متن درباره چیست؟", en: "What is the text about?" },
          options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
          correct: 0,
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
        },
        {
          id: "mix-2",
          type: "multiple_choice",
          question: {
            fa: "حرف تعریف مناسب برای 'Kind' چیست؟",
            en: "What is the article for 'Kind'?",
          },
          options: ["der", "die", "das", "den"],
          correct: 2,
        },
      ],
    };

    return samples[type] || samples.mixed;
  };

  const handleSubmit = (answers) => {
    // محاسبه نمره
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    const earnedXP = Math.round((score / 100) * 50);

    toast.success(`✅ ${score}% - ${earnedXP} XP کسب کردید!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
      </div>
    );
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/practice")}
        icon={ArrowLeft}
        className="mb-6"
      >
        {language === "fa" ? "بازگشت به تمرین‌ها" : "Back to Practice"}
      </Button>

      <Card variant="elevated" padding="lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {language === "fa" ? "🏋️ تمرین" : "🏋️ Exercise"}
          </h1>
          <p className="text-neutral-500">
            {language === "fa"
              ? `${questions.length} سوال`
              : `${questions.length} questions`}
          </p>
        </div>

        <ExerciseEngine
          questions={questions}
          onComplete={handleSubmit}
          language={language}
        />
      </Card>
    </div>
  );
};

export default ExercisePage;
