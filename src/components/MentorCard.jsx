/**
 * MentorCard.jsx
 * Path: src/components/MentorCard.jsx
 * Description: Mentor card component
 * Changes:
 * - M29: Added loading="lazy" on images
 * - M27: Added React.memo for performance
 */

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Users, Calendar, ChevronRight } from "lucide-react";
import Button from "./ui/Button";

export const MentorCard = memo(
  ({ mentor, onBook, onViewProfile, className = "" }) => {
    const {
      id,
      name,
      avatar,
      level,
      rating,
      totalStudents,
      hourlyRate,
      bio,
      languages,
      specializations,
      isVerified,
    } = mentor;

    const getLanguageText = (lang) => {
      const map = {
        fa: "فارسی",
        en: "English",
        de: "Deutsch",
        ar: "العربية",
        tr: "Türkçe",
        ru: "Русский",
      };
      return map[lang] || lang;
    };

    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700
        overflow-hidden hover:shadow-md transition-shadow duration-200
        ${className}
      `}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar with lazy loading */}
            <img
              src={avatar || "/default-avatar.png"}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-800"
              loading="lazy" // ✅ M29: Lazy loading for images
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {name}
                </h3>
                {isVerified && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Level {level}
                </span>
                <span className="flex items-center gap-1 text-sm text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  {rating?.toFixed(1) || "New"}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {totalStudents || 0}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {languages?.map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                  >
                    {getLanguageText(lang)}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                ${hourlyRate}
              </p>
              <p className="text-xs text-gray-500">/ hour</p>
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {typeof bio === "string" ? bio : bio.fa || bio.en}
            </p>
          )}

          {/* Specializations */}
          {specializations?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {specializations.slice(0, 3).map((spec) => (
                <span
                  key={spec}
                  className="px-2 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded"
                >
                  {spec}
                </span>
              ))}
              {specializations.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-gray-500">
                  +{specializations.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onBook?.(id)}
              icon={Calendar}
              iconPosition="left"
            >
              Book Session
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewProfile?.(id)}
              icon={ChevronRight}
              iconPosition="right"
            >
              Profile
            </Button>
          </div>
        </div>
      </motion.div>
    );
  },
);

MentorCard.displayName = "MentorCard";

export default MentorCard;
