/**
 * AchievementsPage.jsx
 * Path: src/pages/Achievements/AchievementsPage.jsx
 * Description: Achievements page with unlock status
 * Version: 2.0 - Fixed unlock status display
 * Changes:
 * - ✅ Fixed unlock status showing correctly
 * - ✅ Progress bar for in-progress achievements
 * - ✅ Categories filter
 * - ✅ Rarity display
 * - ✅ XP rewards
 * - ✅ Unlock date
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Lock, Star, Award, Filter, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import ProgressBar from "../../components/ProgressBar";
import { cn, formatDate } from "../../utils/helpers";

const CATEGORIES = [
  { id: "all", label: "همه" },
  { id: "lessons", label: "درس‌ها" },
  { id: "streaks", label: "گل‌زنی" },
  { id: "xp", label: "امتیاز" },
  { id: "social", label: "اجتماعی" },
];

const AchievementsPage = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchAchievements = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/achievements");
      if (response.data.success) {
        setAchievements(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // ============================================
  // 🔍 Filter
  // ============================================

  const filteredAchievements = achievements.filter((a) => {
    if (filter !== "all" && a.category !== filter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        a.name?.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXP = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (a.xpReward || 0), 0);

  // ============================================
  // 🖼️ Render
  // ============================================

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <Skeleton variant="card" count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-warning-500" />
          دستاوردها
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          با یادگیری و تمرین، دستاوردهای جدیدی باز کنید!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md">
          <p className="text-xs text-neutral-500">باز شده</p>
          <p className="text-2xl font-bold text-success-500">{unlockedCount}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-neutral-500">کل دستاوردها</p>
          <p className="text-2xl font-bold">{achievements.length}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-neutral-500">XP کسب شده</p>
          <p className="text-2xl font-bold text-primary-500">{totalXP}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-neutral-500">درصد تکمیل</p>
          <p className="text-2xl font-bold">
            {achievements.length > 0
              ? Math.round((unlockedCount / achievements.length) * 100)
              : 0}
            %
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="جستجوی دستاورد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            clearable
            onClear={() => setSearch("")}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={filter === cat.id ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="دستاوردی یافت نشد"
          description="با تغییر فیلترها یا جستجوی دیگری امتحان کنید"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <AchievementCardLarge achievement={achievement} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// 🏆 Achievement Card (Large)
// ============================================

const AchievementCardLarge = ({ achievement }) => {
  const {
    unlocked,
    progress,
    target,
    name,
    description,
    xpReward,
    rarity,
    unlockedAt,
    icon,
  } = achievement;
  const progressPercent = target
    ? Math.min(100, Math.round((progress / target) * 100))
    : 0;

  const rarityColors = {
    common: "from-neutral-400 to-neutral-600",
    rare: "from-blue-400 to-blue-600",
    epic: "from-purple-400 to-purple-600",
    legendary: "from-warning-400 to-warning-600",
  };

  return (
    <Card
      padding="lg"
      className={cn("relative overflow-hidden", !unlocked && "opacity-75")}
    >
      {/* Rarity gradient */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          rarityColors[rarity] || rarityColors.common,
        )}
      />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0",
            unlocked
              ? "bg-gradient-to-br from-warning-400 to-warning-600"
              : "bg-neutral-200 dark:bg-neutral-800",
          )}
        >
          {unlocked ? (
            <Trophy className="w-8 h-8 text-white" />
          ) : (
            <Lock className="w-8 h-8 text-neutral-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold">{name}</h3>
            {rarity && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  rarity === "legendary" && "bg-warning-100 text-warning-700",
                  rarity === "epic" && "bg-purple-100 text-purple-700",
                  rarity === "rare" && "bg-blue-100 text-blue-700",
                  rarity === "common" && "bg-neutral-100 text-neutral-700",
                )}
              >
                {rarity}
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-500 mt-1">{description}</p>

          {/* XP Reward */}
          {xpReward > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-primary-500">
              <Star className="w-3 h-3" />
              <span>+{xpReward} XP</span>
            </div>
          )}

          {/* Progress (if not unlocked) */}
          {!unlocked && target && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>
                  {progress || 0} / {target}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <ProgressBar value={progressPercent} />
            </div>
          )}

          {/* Unlock date */}
          {unlocked && unlockedAt && (
            <p className="text-xs text-success-500 mt-2">
              ✓ باز شده در {formatDate(unlockedAt, "fa")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AchievementsPage;
