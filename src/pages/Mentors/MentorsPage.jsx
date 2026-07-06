/**
 * MentorsPage.jsx
 * Path: src/pages/Mentors/MentorsPage.jsx
 * Description: Mentors page with improved error handling
 * Version: 4.0 - Fixed multi-language rendering
 * Changes:
 * - ✅ Fixed: Objects are not valid as React child
 * - ✅ Using getLocalizedText for all translations
 * - ✅ Complete rewrite with proper localization
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import { getLocalizedText } from "../../utils/i18n";
import api from "@services/api";
import debug from "../../utils/debug";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Star,
  CheckCircle,
  ChevronLeft,
  Calendar,
  X,
  Users,
  Search,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";
import Skeleton from "@components/ui/Skeleton";

// ============================================
// 📊 Mock Data (با ساختار چندزبانه)
// ============================================

const MOCK_MENTORS = [
  {
    id: "mentor-1",
    userId: "user-1",
    level: "A1",
    hourlyRate: 15,
    rating: 4.8,
    totalStudents: 25,
    languages: ["fa", "de", "en"],
    specializations: ["مکالمه", "گرامر", "تلفظ"],
    bio: {
      fa: "مدرس با تجربه زبان آلمانی با ۵ سال سابقه تدریس",
      en: "Experienced German teacher with 5 years of teaching experience",
      de: "Erfahrener Deutschlehrer mit 5 Jahren Unterrichtserfahrung",
    },
    isVerified: true,
    user: {
      name: "آنا اشمیت",
      email: "anna@example.com",
      avatar: null,
    },
  },
  {
    id: "mentor-2",
    userId: "user-2",
    level: "B1",
    hourlyRate: 20,
    rating: 4.9,
    totalStudents: 40,
    languages: ["fa", "de"],
    specializations: ["آزمون گوته", "مکالمه", "نوشتار"],
    bio: {
      fa: "متخصص آموزش آلمانی برای آزمون‌های گوته و آمادگی مهاجرت",
      en: "Specialist in German education for Goethe exams and migration preparation",
      de: "Spezialist für Deutschunterricht für Goethe-Prüfungen und Migrationsvorbereitung",
    },
    isVerified: true,
    user: {
      name: "توماس وبر",
      email: "thomas@example.com",
      avatar: null,
    },
  },
];

// ============================================
// 📊 Skeleton Component
// ============================================

const MentorsSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <div>
      <Skeleton variant="title" className="w-48" />
      <Skeleton variant="subtitle" className="w-64 mt-1" />
    </div>
    <div className="flex flex-wrap gap-4 mb-6">
      <Skeleton variant="text" className="flex-1 h-12" />
      <Skeleton variant="button" className="w-32 h-12" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="h-[280px]">
          <div className="flex flex-col items-center text-center">
            <Skeleton variant="avatar" className="w-16 h-16" />
            <Skeleton variant="title" className="w-32 mt-3" />
            <Skeleton variant="text" className="w-40 mt-1" />
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} variant="avatar" className="w-4 h-4" />
              ))}
            </div>
            <Skeleton variant="text" className="w-full mt-3" />
            <Skeleton variant="button" className="w-full mt-3 h-10" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================
// 📊 MentorsPage Component
// ============================================

const MentorsPage = () => {
  const { user, logout } = useAuth();
  const { language } = useLanguageContext();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    duration: 60,
  });
  const [isBooking, setIsBooking] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  // ============================================
  // 📥 Load Data
  // ============================================

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/mentors");

      let mentorsData = [];
      if (Array.isArray(response)) {
        mentorsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        mentorsData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        mentorsData = response.data.data;
      }

      if (mentorsData.length > 0) {
        setMentors(mentorsData);
        setUseMockData(false);
      } else {
        setMentors(MOCK_MENTORS);
        setUseMockData(true);
      }
    } catch (error) {
      debug.error("Error loading mentors:", error);
      setMentors(MOCK_MENTORS);
      setUseMockData(true);

      if (error.response?.status === 401) {
        setError(
          language === "fa"
            ? "نشست شما منقضی شده است. لطفاً دوباره وارد شوید."
            : "Your session has expired. Please login again.",
        );
      } else {
        setError(error.response?.data?.message || "خطا در بارگذاری منتورها");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🎯 Localization Helpers
  // ============================================

  const getBio = (mentor) => {
    if (!mentor) return "";
    return getLocalizedText(mentor.bio, language, "بدون توضیحات");
  };

  const getUserName = (mentor) => {
    if (!mentor) return "";
    if (mentor.user?.name) return mentor.user.name;
    return "منتور";
  };

  const getSpecializations = (mentor) => {
    if (!mentor?.specializations) return [];
    return mentor.specializations;
  };

  const getLanguages = (mentor) => {
    if (!mentor?.languages) return ["fa", "de"];
    return mentor.languages;
  };

  // ============================================
  // 🛠️ Helper Functions
  // ============================================

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

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const halfStar = (rating || 0) % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-4 h-4 fill-yellow-500 text-yellow-500"
          />
        ))}
        {halfStar && (
          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-4 h-4 text-neutral-300 dark:text-neutral-600"
          />
        ))}
      </div>
    );
  };

  const filteredMentors = Array.isArray(mentors)
    ? mentors.filter((mentor) => {
        if (!mentor) return false;

        const name = getUserName(mentor).toLowerCase();
        const bio = getBio(mentor).toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch =
          name.includes(searchLower) ||
          bio.includes(searchLower) ||
          mentor.specializations?.some((s) =>
            s.toLowerCase().includes(searchLower),
          );

        const matchesLevel =
          selectedLevel === "all" || mentor.level === selectedLevel;

        return matchesSearch && matchesLevel;
      })
    : [];

  // ============================================
  // 🎮 Actions
  // ============================================

  const openBooking = (mentor) => {
    setSelectedMentor(mentor);
    setShowBooking(true);
    setBookingData({
      date: "",
      time: "",
      duration: 60,
    });
  };

  const closeBooking = () => {
    setShowBooking(false);
    setSelectedMentor(null);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!bookingData.date || !bookingData.time) {
      toast.error("لطفاً تاریخ و زمان را انتخاب کنید");
      return;
    }

    setIsBooking(true);
    try {
      const startTime = new Date(`${bookingData.date}T${bookingData.time}`);
      const endTime = new Date(
        startTime.getTime() + bookingData.duration * 60000,
      );

      await api.post(`/mentors/${selectedMentor.id}/book`, {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      toast.success("جلسه با موفقیت رزرو شد!");
      closeBooking();
    } catch (error) {
      debug.error("Booking error:", error);
      toast.error(error.response?.data?.message || "خطا در رزرو جلسه");
    } finally {
      setIsBooking(false);
    }
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  if (loading) {
    return <MentorsSkeleton />;
  }

  if (error && mentors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-danger-500" />
        <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md">
          {error}
        </p>
        <Button variant="primary" onClick={loadMentors} icon={RefreshCw}>
          {language === "fa" ? "تلاش مجدد" : "Retry"}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {language === "fa" ? "👨‍🏫 منتورها" : "👨‍🏫 Mentors"}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              {language === "fa"
                ? `${filteredMentors.length} منتور برای یادگیری بهتر`
                : `${filteredMentors.length} mentors to help you learn`}
              {useMockData && (
                <span className="text-xs text-amber-500 mr-2">
                  (داده‌های نمونه)
                </span>
              )}
            </p>
          </div>
          <Button variant="primary" icon={UserPlus}>
            {language === "fa" ? "ثبت‌نام به عنوان منتور" : "Become a Mentor"}
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              language === "fa" ? "جستجوی منتور..." : "Search mentors..."
            }
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
        >
          <option value="all">
            {language === "fa" ? "همه سطوح" : "All Levels"}
          </option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Mentors Grid */}
      {filteredMentors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {language === "fa"
              ? "هیچ منتوری با این شرایط پیدا نشد"
              : "No mentors found matching your criteria"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="bordered" padding="lg" hover>
                {/* Profile */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {getUserName(mentor).charAt(0) || "M"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {getUserName(mentor)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="primary" size="xs">
                        {mentor.level || "A1"}
                      </Badge>
                      <span className="text-xs text-neutral-500">
                        {mentor.totalStudents || 0}{" "}
                        {language === "fa" ? "دانشجو" : "students"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getRatingStars(mentor.rating || 0)}
                      <span className="text-xs text-neutral-500">
                        ({mentor.rating || 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio - ✅ FIXED: Using getBio() which returns string */}
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4">
                  {getBio(mentor)}
                </p>

                {/* Specializations */}
                {getSpecializations(mentor).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getSpecializations(mentor)
                      .slice(0, 3)
                      .map((spec, i) => (
                        <Badge key={i} variant="secondary" size="xs">
                          {spec}
                        </Badge>
                      ))}
                    {getSpecializations(mentor).length > 3 && (
                      <Badge variant="secondary" size="xs">
                        +{getSpecializations(mentor).length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Languages */}
                <div className="flex items-center gap-3 mb-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {getLanguages(mentor).join(", ")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {mentor.hourlyRate || 15} €/h
                  </span>
                  {mentor.isVerified && (
                    <Badge variant="success" size="xs">
                      ✓ {language === "fa" ? "تأیید شده" : "Verified"}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openBooking(mentor)}
                  icon={Calendar}
                  fullWidth
                >
                  {language === "fa" ? "رزرو جلسه" : "Book Session"}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {language === "fa" ? "رزرو جلسه" : "Book Session"}
                </h2>
                <button
                  onClick={closeBooking}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {getUserName(selectedMentor).charAt(0) || "M"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {getUserName(selectedMentor)}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {selectedMentor.level || "A1"} •{" "}
                    {selectedMentor.hourlyRate || 15} €/h
                  </p>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {language === "fa" ? "تاریخ" : "Date"}
                  </label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, date: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {language === "fa" ? "زمان" : "Time"}
                  </label>
                  <input
                    type="time"
                    value={bookingData.time}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, time: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {language === "fa"
                      ? "مدت زمان (دقیقه)"
                      : "Duration (minutes)"}
                  </label>
                  <select
                    value={bookingData.duration}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  >
                    <option value="30">30 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-950 rounded-lg">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {language === "fa" ? "هزینه کل" : "Total Price"}
                  </span>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {Math.round(
                      (selectedMentor.hourlyRate || 15) *
                        (bookingData.duration / 60),
                    )}{" "}
                    €
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isBooking}
                  >
                    {language === "fa" ? "تایید رزرو" : "Confirm Booking"}
                  </Button>
                  <Button variant="secondary" onClick={closeBooking}>
                    {language === "fa" ? "لغو" : "Cancel"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentorsPage;
