import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { useAuth } from "@context/AuthContext";
import {
  BookOpen,
  Bot,
  Trophy,
  Users,
  Zap,
  Globe,
  ArrowLeft,
  CheckCircle,
  Star,
  Sparkles,
} from "lucide-react";
import Button from "@components/ui/Button";

function HomePage() {
  const { language, isRTL } = useLanguageContext();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: { fa: "درس‌های تعاملی", en: "Interactive Lessons" },
      description: {
        fa: "یادگیری با درس‌های ساختاریافته از A1 تا C2",
        en: "Learn with structured lessons from A1 to C2",
      },
      color: "from-blue-400 to-blue-600",
      bgLight: "bg-blue-50 hover:bg-blue-100",
      darkBg: "dark:bg-neutral-900 dark:hover:bg-blue-950",
      borderHover: "hover:border-blue-300 dark:hover:border-blue-700",
      shadowHover:
        "hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20",
    },
    {
      icon: Bot,
      title: { fa: "معلم هوش مصنوعی", en: "AI Tutor" },
      description: {
        fa: "مکالمه با هوش مصنوعی و تصحیح تلفظ و گرامر",
        en: "Chat with AI and get pronunciation & grammar correction",
      },
      color: "from-purple-400 to-purple-600",
      bgLight: "bg-purple-50 hover:bg-purple-100",
      darkBg: "dark:bg-neutral-900 dark:hover:bg-purple-950",
      borderHover: "hover:border-purple-300 dark:hover:border-purple-700",
      shadowHover:
        "hover:shadow-md hover:shadow-purple-100 dark:hover:shadow-purple-900/20",
    },
    {
      icon: Trophy,
      title: { fa: "گیمیفیکیشن", en: "Gamification" },
      description: {
        fa: "کسب امتیاز، دستاوردها و رقابت با دوستان",
        en: "Earn XP, achievements and compete with friends",
      },
      color: "from-amber-400 to-amber-600",
      bgLight: "bg-amber-50 hover:bg-amber-100",
      darkBg: "dark:bg-neutral-900 dark:hover:bg-amber-950",
      borderHover: "hover:border-amber-300 dark:hover:border-amber-700",
      shadowHover:
        "hover:shadow-md hover:shadow-amber-100 dark:hover:shadow-amber-900/20",
    },
    {
      icon: Globe,
      title: { fa: "سناریوهای واقعی", en: "Real Scenarios" },
      description: {
        fa: "تمرین موقعیت‌های واقعی زندگی در آلمان",
        en: "Practice real-life situations in Germany",
      },
      color: "from-green-400 to-green-600",
      bgLight: "bg-green-50 hover:bg-green-100",
      darkBg: "dark:bg-neutral-900 dark:hover:bg-green-950",
      borderHover: "hover:border-green-300 dark:hover:border-green-700",
      shadowHover:
        "hover:shadow-md hover:shadow-green-100 dark:hover:shadow-green-900/20",
    },
    {
      icon: Users,
      title: { fa: "منتورهای بومی", en: "Native Mentors" },
      description: {
        fa: "ارتباط با معلمان آلمانی‌زبان برای تمرین",
        en: "Connect with native German speakers",
      },
      color: "from-red-400 to-red-600",
      bgLight: "bg-red-50 hover:bg-red-100",
      darkBg: "dark:bg-neutral-900 dark:hover:bg-red-950",
      borderHover: "hover:border-red-300 dark:hover:border-red-700",
      shadowHover:
        "hover:shadow-md hover:shadow-red-100 dark:hover:shadow-red-900/20",
    },
    {
      icon: Zap,
      title: { fa: "مرور هوشمند", en: "Smart Review" },
      description: {
        fa: "سیستم مرور فاصله‌دار برای حفظ بهتر لغات",
        en: "Spaced repetition system for better retention",
      },
      color: "from-cyan-400 to-cyan-600",
      bgLight: "bg-cyan-50 hover:bg-cyan-100",
      darkBg: "dark:bg-neutral-900 dark:hover:bg-cyan-950",
      borderHover: "hover:border-cyan-300 dark:hover:border-cyan-700",
      shadowHover:
        "hover:shadow-md hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20",
    },
  ];

  const paths = [
    {
      title: { fa: "آزمون گوته", en: "Goethe Exam" },
      description: {
        fa: "آمادگی برای آزمون‌های A1 تا B2 گوته",
        en: "Prepare for Goethe A1-B2 exams",
      },
      level: "A1-B2",
      color: "bg-blue-500",
      bgLight: "bg-blue-50 hover:bg-blue-100",
      darkBg: "dark:bg-neutral-800 dark:hover:bg-blue-950",
      borderHover: "hover:border-blue-300 dark:hover:border-blue-700",
      shadowHover:
        "hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20",
    },
    {
      title: { fa: "آوسبیلدونگ", en: "Ausbildung" },
      description: {
        fa: "زبان تخصصی برای دوره‌های فنی و حرفه‌ای",
        en: "Specialized German for vocational training",
      },
      level: "B1-B2",
      color: "bg-green-500",
      bgLight: "bg-green-50 hover:bg-green-100",
      darkBg: "dark:bg-neutral-800 dark:hover:bg-green-950",
      borderHover: "hover:border-green-300 dark:hover:border-green-700",
      shadowHover:
        "hover:shadow-md hover:shadow-green-100 dark:hover:shadow-green-900/20",
    },
    {
      title: { fa: "دانشگاه", en: "University" },
      description: {
        fa: "آمادگی برای تحصیل در دانشگاه‌های آلمان",
        en: "Prepare for studying at German universities",
      },
      level: "C1",
      color: "bg-purple-500",
      bgLight: "bg-purple-50 hover:bg-purple-100",
      darkBg: "dark:bg-neutral-800 dark:hover:bg-purple-950",
      borderHover: "hover:border-purple-300 dark:hover:border-purple-700",
      shadowHover:
        "hover:shadow-md hover:shadow-purple-100 dark:hover:shadow-purple-900/20",
    },
    {
      title: { fa: "کار در آلمان", en: "Work in Germany" },
      description: {
        fa: "زبان تخصصی محیط کار و مصاحبه شغلی",
        en: "Business German & job interview preparation",
      },
      level: "B1-C1",
      color: "bg-amber-500",
      bgLight: "bg-amber-50 hover:bg-amber-100",
      darkBg: "dark:bg-neutral-800 dark:hover:bg-amber-950",
      borderHover: "hover:border-amber-300 dark:hover:border-amber-700",
      shadowHover:
        "hover:shadow-md hover:shadow-amber-100 dark:hover:shadow-amber-900/20",
    },
  ];

  const stats = [
    { value: "۵۰,۰۰۰+", label: { fa: "زبان‌آموز", en: "Learners" } },
    { value: "۵۴۰+", label: { fa: "درس تعاملی", en: "Interactive Lessons" } },
    {
      value: "۴.۸",
      label: { fa: "امتیاز کاربران", en: "User Rating" },
      icon: Star,
    },
    { value: "۱۰۰٪", label: { fa: "رایگان", en: "Free" } },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="overflow-hidden">
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-blue-50 via-primary-50 to-sky-50 dark:from-neutral-950 dark:to-neutral-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-5 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary-300 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-200 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-right"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-full text-sm font-medium text-primary-600 dark:text-primary-400 mb-6 shadow-sm">
                <Zap className="w-4 h-4" />
                {language === "fa"
                  ? "یادگیری آلمانی با هوش مصنوعی"
                  : "Learn German with AI"}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-neutral-900 dark:text-neutral-100 leading-tight mb-6">
                {language === "fa" ? (
                  <>
                    <span className="block sm:inline">آلمانی رو </span>
                    <span className="gradient-text block sm:inline">
                      هوشمندانه
                    </span>
                    <span className="block sm:inline"> یاد بگیر</span>
                  </>
                ) : (
                  <>
                    <span className="block sm:inline">Learn German </span>
                    <span className="gradient-text block sm:inline">
                      Smartly
                    </span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {language === "fa"
                  ? "پلتفرم رایگان و مدرن آموزش زبان آلمانی با تمرکز بر مکالمه واقعی، هوش مصنوعی و گیمیفیکیشن. از مبتدی تا پیشرفته، مسیر مهاجرت تو هموار می‌کنیم."
                  : "A free, modern German learning platform focused on real conversation, AI, and gamification. From beginner to advanced, we pave your path to Germany."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {language === "fa"
                        ? "رفتن به داشبورد"
                        : "Go to Dashboard"}
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <button className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-primary-600 hover:border-primary-500 dark:bg-primary-500 dark:hover:bg-primary-400 dark:border-primary-500 dark:hover:border-primary-400 dark:text-white">
                        {language === "fa"
                          ? "شروع یادگیری رایگان"
                          : "Start Learning Free"}
                      </button>
                    </Link>
                    <Link to="/login">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        {language === "fa" ? "ورود به حساب" : "Sign In"}
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-10 flex-wrap">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {stat.icon && (
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    )}
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {stat.value}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {stat.label[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Illustration - Desktop Only */}
            <motion.div
              className="hidden lg:flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-full max-w-md">
                <div className="w-full aspect-square bg-gradient-to-br from-primary-400 to-accent-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <div className="text-center text-white p-8">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl sm:text-5xl font-bold">L</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                      Learning Academy
                    </h2>
                    <p className="text-white/80 text-base sm:text-lg">
                      {language === "fa"
                        ? "یادگیری هوشمند آلمانی"
                        : "Smart German Learning"}
                    </p>
                  </div>
                </div>

                <motion.div
                  className="absolute -top-4 -left-4 bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <CheckCircle className="w-5 h-5 text-success-500" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 -right-4 bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <Trophy className="w-5 h-5 text-amber-500" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-16 lg:py-24 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === "fa"
                ? "چرا آکادمی یادگیری؟"
                : "Why Learning Academy?"}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">
              {language === "fa"
                ? "ترکیبی از بهترین روش‌های یادگیری زبان در یک پلتفرم رایگان"
                : "Combining the best language learning methods in one free platform"}
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={`group relative ${feature.bgLight} ${feature.darkBg} rounded-2xl p-5 sm:p-6 lg:p-8 border-2 border-transparent ${feature.borderHover} dark:border-neutral-800 shadow-sm ${feature.shadowHover} transition-all duration-300 active:scale-[0.98]`}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {feature.title[language]}
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                    {feature.description[language]}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========== LEARNING PATHS SECTION ========== */}
      <section className="py-16 lg:py-24 bg-sky-50/50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === "fa"
                ? "مسیر یادگیری خود را انتخاب کنید"
                : "Choose Your Learning Path"}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">
              {language === "fa"
                ? "از مهاجرت تا تحصیل، مسیر مخصوص خودت رو پیدا کن"
                : "From migration to education, find your perfect path"}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {paths.map((path, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group ${path.bgLight} ${path.darkBg} rounded-2xl p-5 sm:p-6 border-2 border-transparent ${path.borderHover} dark:border-neutral-700 shadow-sm ${path.shadowHover} transition-all duration-300 cursor-pointer active:scale-[0.98]`}
              >
                <div
                  className={`w-10 h-10 ${path.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {path.title[language]}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  {path.description[language]}
                </p>
                <span className="inline-block px-3 py-1 bg-white dark:bg-neutral-700 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-300 shadow-sm">
                  {path.level}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-700 dark:to-accent-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              {language === "fa" ? "آماده‌ای شروع کنی؟" : "Ready to Start?"}
            </h2>
            <p className="text-white/90 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              {language === "fa"
                ? "همین حالا ثبت‌نام کن و اولین درس آلمانی‌ات رو شروع کن. کاملاً رایگان!"
                : "Sign up now and start your first German lesson. Completely free!"}
            </p>
            {!isAuthenticated && (
              <Link to="/register">
                <button className="px-10 py-4 bg-white hover:bg-neutral-100 text-primary-700 hover:text-primary-800 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 dark:bg-primary-400 dark:hover:bg-primary-300 dark:text-neutral-900 dark:shadow-primary-900/30">
                  {language === "fa"
                    ? "شروع یادگیری رایگان"
                    : "Start Learning Free"}
                  <ArrowLeft className="w-5 h-5 inline mr-2" />
                </button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
