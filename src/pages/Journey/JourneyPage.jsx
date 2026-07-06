import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
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
} from "lucide-react";
import Button from "@components/ui/Button";
import ProgressBar from "@components/ProgressBar";
import { cn } from "@utils/helpers";

const journeys = [
  {
    id: "integration",
    icon: "🏠",
    title: { fa: "مسیر ادغام", en: "Integration Path" },
    description: {
      fa: "یادگیری زبان و فرهنگ آلمان برای زندگی روزمره",
      en: "Learn German language and culture for everyday life",
    },
    progress: 35,
    totalStages: 10,
    completedStages: 3,
    color: "from-green-400 to-emerald-600",
    stages: [
      {
        id: 1,
        title: { fa: "سلام و احوالپرسی", en: "Greetings" },
        icon: "👋",
        completed: true,
      },
      {
        id: 2,
        title: { fa: "خرید روزانه", en: "Daily Shopping" },
        icon: "🛒",
        completed: true,
      },
      {
        id: 3,
        title: { fa: "حمل و نقل", en: "Transportation" },
        icon: "🚌",
        completed: true,
      },
      {
        id: 4,
        title: { fa: "درمان و دکتر", en: "Healthcare" },
        icon: "🏥",
        completed: false,
        current: true,
      },
      {
        id: 5,
        title: { fa: "ارتباطات", en: "Communication" },
        icon: "📱",
        completed: false,
        locked: true,
      },
      {
        id: 6,
        title: { fa: "کارهای اداری", en: "Bureaucracy" },
        icon: "📄",
        completed: false,
        locked: true,
      },
      {
        id: 7,
        title: { fa: "دوستان و اجتماع", en: "Friends & Community" },
        icon: "👥",
        completed: false,
        locked: true,
      },
      {
        id: 8,
        title: { fa: "فرهنگ و رسوم", en: "Culture & Customs" },
        icon: "🎭",
        completed: false,
        locked: true,
      },
      {
        id: 9,
        title: { fa: "موقعیت‌های اضطراری", en: "Emergencies" },
        icon: "🆘",
        completed: false,
        locked: true,
      },
      {
        id: 10,
        title: { fa: "شهروندی", en: "Citizenship" },
        icon: "🎉",
        completed: false,
        locked: true,
      },
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
    progress: 10,
    totalStages: 8,
    completedStages: 1,
    color: "from-blue-400 to-indigo-600",
    stages: [
      {
        id: 1,
        title: { fa: "معرفی حرفه‌ای", en: "Professional Intro" },
        icon: "🎯",
        completed: true,
      },
      {
        id: 2,
        title: { fa: "رزومه آلمانی", en: "German CV" },
        icon: "📝",
        completed: false,
        current: true,
      },
      {
        id: 3,
        title: { fa: "مصاحبه شغلی", en: "Job Interview" },
        icon: "🤝",
        completed: false,
        locked: true,
      },
      {
        id: 4,
        title: { fa: "ایمیل‌های کاری", en: "Work Emails" },
        icon: "✉️",
        completed: false,
        locked: true,
      },
      {
        id: 5,
        title: { fa: "جلسات کاری", en: "Meetings" },
        icon: "📊",
        completed: false,
        locked: true,
      },
      {
        id: 6,
        title: { fa: "مذاکره حقوق", en: "Salary Negotiation" },
        icon: "💰",
        completed: false,
        locked: true,
      },
      {
        id: 7,
        title: { fa: "قوانین کار", en: "Labor Law" },
        icon: "⚖️",
        completed: false,
        locked: true,
      },
      {
        id: 8,
        title: { fa: "پیشرفت شغلی", en: "Career Growth" },
        icon: "🚀",
        completed: false,
        locked: true,
      },
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
    progress: 0,
    totalStages: 10,
    completedStages: 0,
    color: "from-purple-400 to-violet-600",
    stages: [
      {
        id: 1,
        title: { fa: "انتخاب رشته", en: "Course Selection" },
        icon: "🔍",
        completed: false,
        current: true,
      },
      {
        id: 2,
        title: { fa: "مدارک مورد نیاز", en: "Required Documents" },
        icon: "📋",
        completed: false,
        locked: true,
      },
      {
        id: 3,
        title: { fa: "انگیزه‌نامه", en: "Motivation Letter" },
        icon: "✍️",
        completed: false,
        locked: true,
      },
      {
        id: 4,
        title: { fa: "آزمون ورودی", en: "Entrance Exam" },
        icon: "📚",
        completed: false,
        locked: true,
      },
      {
        id: 5,
        title: { fa: "مصاحبه دانشگاه", en: "University Interview" },
        icon: "🎤",
        completed: false,
        locked: true,
      },
      {
        id: 6,
        title: { fa: "ویزای تحصیلی", en: "Student Visa" },
        icon: "🛂",
        completed: false,
        locked: true,
      },
      {
        id: 7,
        title: { fa: "خوابگاه", en: "Dormitory" },
        icon: "🏘️",
        completed: false,
        locked: true,
      },
      {
        id: 8,
        title: { fa: "ترم اول", en: "First Semester" },
        icon: "📖",
        completed: false,
        locked: true,
      },
      {
        id: 9,
        title: { fa: "کار دانشجویی", en: "Student Job" },
        icon: "💵",
        completed: false,
        locked: true,
      },
      {
        id: 10,
        title: { fa: "فارغ‌التحصیلی", en: "Graduation" },
        icon: "🎓",
        completed: false,
        locked: true,
      },
    ],
  },
];

function JourneyPage() {
  const { language } = useLanguageContext();
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [activeJourney, setActiveJourney] = useState("integration");

  const journey =
    selectedJourney || journeys.find((j) => j.id === activeJourney);

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
          {journeys.map((j, index) => (
            <motion.button
              key={j.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedJourney(j)}
              className={cn(
                "bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-soft text-right hover:shadow-lg transition-all duration-300",
                activeJourney === j.id && "ring-2 ring-primary-500",
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
                value={j.completedStages}
                max={j.totalStages}
                size="md"
                color={j.progress > 0 ? "success" : "primary"}
                showLabel
              />
            </motion.button>
          ))}
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
              value={journey.completedStages}
              max={journey.totalStages}
              size="lg"
              color="gradient"
              showLabel
              labelPosition="right"
            />
          </div>

          {/* Stages Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-800" />

            <div className="space-y-4">
              {journey.stages.map((stage, index) => {
                const isCompleted = stage.completed;
                const isCurrent = stage.current;
                const isLocked = stage.locked;

                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative mr-12 bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-soft",
                      isLocked && "opacity-50",
                    )}
                  >
                    {/* Timeline Dot */}
                    <div
                      className={cn(
                        "absolute right-[-2.25rem] top-6 w-5 h-5 rounded-full border-4 border-white dark:border-neutral-900",
                        isCompleted
                          ? "bg-success-500"
                          : isCurrent
                            ? "bg-primary-500 ring-4 ring-primary-100 dark:ring-primary-900"
                            : "bg-neutral-300 dark:bg-neutral-700",
                      )}
                    />

                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{stage.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            {stage.title[language]}
                          </h3>
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-success-500" />
                          )}
                          {isCurrent && (
                            <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-600 rounded-full">
                              {language === "fa" ? "در حال انجام" : "Current"}
                            </span>
                          )}
                          {isLocked && (
                            <Lock className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">
                          {language === "fa"
                            ? `مرحله ${index + 1} از ${journey.totalStages}`
                            : `Stage ${index + 1} of ${journey.totalStages}`}
                        </p>
                        {isCurrent && (
                          <div className="mt-3">
                            <Button variant="primary" size="sm">
                              {language === "fa" ? "شروع مرحله" : "Start Stage"}
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
          {journey.completedStages > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 rounded-2xl p-6 text-center">
              <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {language === "fa" ? "دستاوردهای مسیر" : "Journey Achievements"}
              </h3>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">
                    {journey.completedStages}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {language === "fa" ? "مرحله تکمیل شده" : "Stages Done"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">
                    {journey.progress}%
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
