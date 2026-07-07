/**
 * XPCard.jsx
 * Path: src/components/XPCard.jsx
 * Description: XP card component for displaying user XP and level
 */

import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { formatNumber } from "../utils/helpers";
import { Award, TrendingUp, Zap } from "lucide-react";
import { cn } from "../utils/helpers";

const XPCard = ({ xp = 0, level = 1, nextLevelXP = 100, className }) => {
  const { language } = useLanguage();
  const progress = Math.min(Math.round((xp / nextLevelXP) * 100), 100);

  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-soft",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {language === "fa" ? "امتیاز شما" : "Your XP"}
            </h3>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatNumber(xp)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {language === "fa" ? "سطح" : "Level"} {level}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">
            {language === "fa"
              ? "پیشرفت به سطح بعدی"
              : "Progress to next level"}
          </span>
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-400">
          <span>{formatNumber(xp)} XP</span>
          <span>{formatNumber(nextLevelXP)} XP</span>
        </div>
      </div>

      {progress >= 100 && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
            {language === "fa"
              ? "🎉 به سطح بعدی رسیدید!"
              : "🎉 You reached the next level!"}
          </span>
        </div>
      )}
    </div>
  );
};

export default XPCard;
