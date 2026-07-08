import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { useAuth } from "@context/AuthContext";
import api from "@services/api";
import {
  Map,
  MapPin,
  CheckCircle,
  Lock,
  Star,
  Flag,
  Home,
  Plane,
  GraduationCap,
  Briefcase,
  Heart,
  ChevronLeft,
  Trophy,
  Target,
  Loader2,
} from "lucide-react";
import Button from "@components/ui/Button";
import ProgressBar from "@components/ProgressBar";
import { cn } from "@utils/helpers";
import toast from "react-hot-toast";

// 🗺️ Journey Definitions (از دیتابیس یا فایل کانفیگ)
const JOURNEY_DEFINITIONS = [
  {
    id: "integration",
    icon: "🏠",
    title: { fa: "مسیر ادغام", en: "Integration Path" },
    description: {
      fa: "یادگیری زبان و فرهنگ آلمان برای زندگی روزمره",
      en: "Learn German language and culture for everyday life",
    },
    color: "from-green-400 to-emerald-600",
    stages: [
      { id: 1, title: { fa: "سلام و احوالپرسی", en: "Greetings" }, icon: "👋" },
      { id: 2, title: { fa: "خرید روزانه", en: "Daily Shopping" }, icon: "🛒" },
      { id: 3, title: { fa: "حمل و نقل", en: "Transportation" }, icon: "🚌" },
      { id: 4, title: { fa: "درمان و دکتر", en: "Healthcare" }, icon: "🏥" },
      { id: 5, title: { fa: "ارتباطات", en: "Communication" }, icon: "📱" },
      { id: 6, title: { fa: "کارهای اداری", en: "Bureaucracy" }, icon: "📄" },
      { id: 7, title: { fa: "دوستان و اجتماع", en: "Friends & Community" }, icon: "👥" },
      { id: 8, title: { fa: "فرهنگ و رسوم", en: "Culture & Customs" }, icon: "🎭" },
      { id: 9, title: { fa: "موقعیت‌های اضطراری", en: "Emergencies" }, icon: "🆘" },
      { id: 10, title: { fa: "شهروندی", en: "Citizenship" }, icon: "🎉" },
    ],
  },
  {
    id: "career",
    icon: "💼",
    title: { fa: "مسیر شغلی", en: "Career Path" },
    description: {
      fa: "آمادگی برای کار و مصاحبه در آلمان",
      en: "Prepare for work and interviews in Germany",
    },
    color: "from-blue-400 to-indigo-600",
    stages: [
      { id: 1, title: { fa: "معرفی حرفه‌ای", en: "Professional Intro" }, icon: "🎯" },
      { id: 2, title: { fa: "رزومه آلمانی", en: "German CV" }, icon: "📝" },
      { id: 3, title: { fa: "مصاحبه شغلی", en: "Job Interview" }, icon: "🤝" },
      { id: 4, title: { fa: "ایمیل‌های کاری", en: "Work Emails" }, icon: "✉️" },
      { id: 5, title: { fa: "جلسات کاری", en: "Meetings" }, icon: "📊" },
      { id: 6, title: { fa: "مذاکره حقوق", en: "Salary Negotiation" }, icon: "💰" },
      { id: 7, title: { fa: "قوانین کار", en: "Labor Law" }, icon: "⚖️" },
      { id: 8, title: { fa: "پیشرفت شغلی", en: "Career Growth" }, icon: "🚀" },
    ],
  },
  {
    id: "education",
    icon: "🎓",
    title: { fa: "مسیر تحصیلی", en: "Education Path" },
    description: {
      fa: "آمادگی برای تحصیل در دانشگاه‌های آلمان",
      en: "Prepare for studying at German universities",
    },
    color: "from-purple-400 to-violet-600",
    stages: [
      { id: 1, title: { fa: "انتخاب رشته", en: "Course Selection" }, icon: "🔍" },
      { id: 2, title: { fa: "مدارک مورد نیاز", en: "Required Documents" }, icon: "📋" },
      { id: 3, title: { fa: "انگیزه‌نامه", en: "Motivation Letter" }, icon: "✍️" },
      { id: 4, title: { fa: "آزمون ورودی", en: "Entrance Exam" }, icon: "📚" },
      { id: 5, title: { fa: "مصاحبه دانشگاه", en: "University Interview" }, icon: "🎤" },
      { id: 6, title: { fa: "ویزای تحصیلی", en: "Student Visa" }, icon: "🛂" },
      { id: 7, title: { fa: "خوابگاه", en: "Dormitory" }, icon: "🏘️" },
      { id: 8, title: { fa: "ترم اول", en: "First Semester" }, icon: "📖" },
      { id: 9, title: { fa: "کار دانشجویی", en: "Student Job" }, icon: "💵" },
      { id: 10, title: { fa: "فارغ‌التحصیلی", en: "Graduation" }, icon: "🎓" },
    ],
  },
];

function JourneyPage() {
  const { language } = useLanguageContext();
  const { user } = useAuth();
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [activeJourney, setActiveJourney] = useState("integration");
  const [loading, setLoading] = useState(true);
  const [journeyProgress, setJourneyProgress] = useState({});
  const [lessonMap, setLessonMap] = useState({});

  // ============================================
  // 📥 Load Progress from API
  // ============================================

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      
      // دریافت پیشرفت درس‌ها از API
      const response = await api.get("/progress");
      const progressData = response?.data?.data || response?.data || [];

      // ساخت Map از پیشرفت درس‌ها
      const progressMap = {};
      progressData.forEach((p) => {
        progressMap[p.lessonId] = p;
      });
      setJourneyProgress(progressMap);

      // دریافت لیست درس‌ها برای نام‌گذاری
      const lessonsRes = await api.get("/lessons");
      const lessons = lessonsRes?.data?.data?.lessons || lessonsRes?.data?.lessons || [];
      const map = {};
      lessons.forEach((l) => {
        map[l.id] = l;
      });
      setLessonMap(map);

    } catch (error) {
      console.error("Error loading journey progress:", error);
      toast.error("خطا در بارگذاری پیشرفت مسیر");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🛠️ Helper: Check if stage is completed
  // ============================================

  const isStageCompleted = (journeyId, stageIndex) => {
    // هر مرحله معادل یک درس است: integration-1 = a1-l01, integration-2 = a1-l02, ...
    const lessonId = `a1-l${String(stageIndex + 1).padStart(2, '0')}`;
    const progress = journeyProgress[lessonId];
    return progress?.status === "completed" || progress?.status === "perfect";
  };

  const isStageCurrent = (journeyId, stageIndex) => {
    const lessonId = `a1-l${String(stageIndex + 1).padStart(2, '0')}`;
    const progress = journeyProgress[lessonId];
    return progress?.status === "in_progress";
  };

  const isStageLocked = (journeyId, stageIndex) => {
    // اگر مرحله ۱ باشد، قفل نیست
    if (stageIndex === 0) return false;
    
    // مرحله قبلی باید تکمیل شده باشد
    const prevLessonId = `a1-l${String(stageIndex).padStart(2, '0')}`;
    const prevProgress = journeyProgress[prevLessonId];
    return !(prevProgress?.status === "completed" || prevProgress?.status === "perfect");
  };

  // ============================================
  // 📊 Calculate Progress
  // ============================================

  const getJourneyProgress = (journey) => {
    const stages = journey.stages || [];
    let completed = 0;
    stages.forEach((_, index) => {
      if (isStageCompleted(journey.id, index)) completed++;
    });
    return {
      completed,
      total: stages.length,
      percentage: stages.length > 0 ? Math.round((completed / stages.length) * 100) : 0,
    };
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
      </div>
    );
  }

  const journey = selectedJourney || JOURNEY_DEFINITIONS.find((j) => j.id === activeJourney);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Map className="w-6 h-6 text-primary-500" />
          {language === "fa" ? "مسیر سفر آلمان" : "Germany Journey"}
        </h1>
        <p className="text-neutral-500 mt-1">
          {language === "fa"
            ? "مسیر مهاجرت خود را مرحله به مرحله طی کن"
            : "Navigate your migration journey step by step"}
        </p>
      </motion.div>

      {/* Journey Selector */}
      {!selectedJourney && (
        <div className="grid sm:grid-cols-3 gap-4">
          {JOURNEY_DEFINITIONS.map((j, index) => {
            const progress = getJourneyProgress(j);
            return (
              <motion.button
                key={j.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedJourney(j)}
                className={cn(
                  "bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-soft text-right hover:shadow-lg transition-all duration-300",
                  activeJourney === j.id && "ring-2 ring-primary-500"
                )}
              >
                <span className="text-4xl block mb-4">{j.icon}</span>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {j.title[language]}
                </h3>
                <p className="text-sm text-neutral-500 mb-4">
                  {j.description[language]}
                </p>
                <ProgressBar
                  value={progress.completed}
                  max={progress.total}
                  size="md"
                  color={progress.percentage > 0 ? "success" : "primary"}
                  showLabel
                />
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Journey Detail */}
      {journey && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {selectedJourney && (
            <button
              onClick={() => setSelectedJourney(null)}
              className="flex items-center gap-2 text-neutral-500 hover:text-primary-500"
            >
              <ChevronLeft className="w-4 h-4" />
              {language === "fa" ? "بازگشت به مسیرها" : "Back to Journeys"}
            </button>
          )}

          {/* Journey Header */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{journey.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {journey.title[language]}
                </h2>
                <p className="text-neutral-500">
                  {journey.description[language]}
                </p>
              </div>
            </div>
            <ProgressBar
              value={getJourneyProgress(journey).completed}
              max={journey.stages.length}
              size="lg"
              color="gradient"
              showLabel
              labelPosition="right"
            />
          </div>

          {/* Stages Timeline */}
          <div className="relative">
            <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-800" />

            <div className="space-y-4">
              {journey.stages.map((stage, index) => {
                const completed = isStageCompleted(journey.id, index);
                const current = isStageCurrent(journey.id, index);
                const locked = isStageLocked(journey.id, index);
                const lessonId = `a1-l${String(index + 1).padStart(2, '0')}`;
                const lesson = lessonMap[lessonId];

                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative mr-12 bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-soft",
                      locked && "opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute right-[-2.25rem] top-6 w-5 h-5 rounded-full border-4 border-white dark:border-neutral-900",
                        completed
                          ? "bg-success-500"
                          : current
                            ? "bg-primary-500 ring-4 ring-primary-100 dark:ring-primary-900"
                            : "bg-neutral-300 dark:bg-neutral-700"
                      )}
                    />

                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{stage.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            {stage.title[language]}
                          </h3>
                          {completed && (
                            <CheckCircle className="w-5 h-5 text-success-500" />
                          )}
                          {current && (
                            <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-600 rounded-full">
                              {language === "fa" ? "در حال انجام" : "Current"}
                            </span>
                          )}
                          {locked && (
                            <Lock className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        {lesson && (
                          <p className="text-xs text-neutral-400">
                            {lesson.title?.fa || lesson.id}
                          </p>
                        )}
                        <p className="text-sm text-neutral-500">
                          {language === "fa"
                            ? `مرحله ${index + 1} از ${journey.stages.length}`
                            : `Stage ${index + 1} of ${journey.stages.length}`}
                        </p>
                        {current && (
                          <div className="mt-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => window.location.href = `/lesson/${lessonId}`}
                            >
                              {language === "fa" ? "ادامه مرحله" : "Continue Stage"}
                            </Button>
                          </div>
                        )}
                        {completed && (
                          <div className="mt-3">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => window.location.href = `/lesson/${lessonId}`}
                            >
                              {language === "fa" ? "مرور مرحله" : "Review Stage"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Rewards */}
          {getJourneyProgress(journey).completed > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 rounded-2xl p-6 text-center">
              <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {language === "fa" ? "دستاوردهای مسیر" : "Journey Achievements"}
              </h3>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">
                    {getJourneyProgress(journey).completed}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {language === "fa" ? "مرحله تکمیل شده" : "Stages Done"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">
                    {getJourneyProgress(journey).percentage}%
                  </p>
                  <p className="text-xs text-neutral-500">
                    {language === "fa" ? "پیشرفت" : "Progress"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default JourneyPage;