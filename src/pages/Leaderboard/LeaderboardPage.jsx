/**
 * LeaderboardPage.jsx
 * Path: src/pages/Leaderboard/LeaderboardPage.jsx
 * Description: Leaderboard with virtualization for performance
 * Version: 2.0 - Fixed virtualization and improved UI
 * Changes:
 * - ✅ Fixed virtualization with react-window
 * - ✅ Time period filter (week, month, all-time)
 * - ✅ Top 3 podium display
 * - ✅ User's rank highlight
 * - ✅ Smooth animations
 * - ✅ Search users
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FixedSizeList as List } from "react-window";
import {
  Trophy,
  Medal,
  Crown,
  Search,
  TrendingUp,
  Zap,
  Flame,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { cn, getInitials, getAvatarColor } from "../../utils/helpers";

const PERIODS = [
  { id: "week", label: "این هفته" },
  { id: "month", label: "این ماه" },
  { id: "all-time", label: "همه زمان‌ها" },
];

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [search, setSearch] = useState("");

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/leaderboard?period=${period}`);
      if (response.data.success) {
        setEntries(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // ============================================
  // 🔍 Filter
  // ============================================

  const filteredEntries = useMemo(() => {
    if (!search) return entries;
    const term = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.name?.toLowerCase().includes(term) ||
        e.username?.toLowerCase().includes(term),
    );
  }, [entries, search]);

  // Top 3 for podium
  const top3 = filteredEntries.slice(0, 3);
  const restEntries = filteredEntries.slice(3);
  const userRank = entries.findIndex((e) => e.id === user?.id);

  // ============================================
  // 🖼️ Loading
  // ============================================

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <Skeleton variant="title" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton variant="card" count={3} />
        </div>
        <Skeleton variant="listItem" count={10} />
      </div>
    );
  }

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-warning-500" />
          جدول رهبران
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          رتبه خود را در میان سایر یادگیرندگان ببینید
        </p>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <Button
            key={p.id}
            variant={period === p.id ? "primary" : "secondary"}
            size="sm"
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="جستجوی کاربر..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={Search}
        clearable
        onClear={() => setSearch("")}
      />

      {/* Podium (Top 3) */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* 2nd place */}
          <PodiumItem entry={top3[1]} place={2} />
          {/* 1st place */}
          <PodiumItem entry={top3[0]} place={1} />
          {/* 3rd place */}
          <PodiumItem entry={top3[2]} place={3} />
        </div>
      )}

      {/* User's rank card */}
      {userRank >= 0 && (
        <Card
          padding="md"
          className="bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-900"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
              {userRank + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium">{user?.name} (شما)</p>
              <p className="text-xs text-neutral-500">{user?.xp || 0} XP</p>
            </div>
            <TrendingUp className="w-5 h-5 text-primary-500" />
          </div>
        </Card>
      )}

      {/* Rest of leaderboard with virtualization */}
      {restEntries.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="موردی یافت نشد"
          description="هیچ کاربری با این مشخصات یافت نشد"
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <List
            height={Math.min(500, restEntries.length * 72)}
            itemCount={restEntries.length}
            itemSize={72}
            width="100%"
          >
            {({ index, style }) => (
              <LeaderboardRow
                entry={restEntries[index]}
                rank={index + 4}
                isCurrentUser={restEntries[index].id === user?.id}
                style={style}
              />
            )}
          </List>
        </Card>
      )}
    </div>
  );
};

// ============================================
// 🏆 Podium Item
// ============================================

const PodiumItem = ({ entry, place }) => {
  const placeConfig = {
    1: {
      icon: Crown,
      iconColor: "text-warning-500",
      bg: "from-warning-400 to-warning-600",
      border: "border-warning-300",
      height: "h-32",
    },
    2: {
      icon: Medal,
      iconColor: "text-neutral-400",
      bg: "from-neutral-300 to-neutral-500",
      border: "border-neutral-300",
      height: "h-24",
    },
    3: {
      icon: Medal,
      iconColor: "text-orange-500",
      bg: "from-orange-400 to-orange-600",
      border: "border-orange-300",
      height: "h-24",
    },
  };

  const config = placeConfig[place];
  const Icon = config.icon;
  const avatarColor = getAvatarColor(entry?.name || entry?.email || "");
  const initials = getInitials(entry?.name || entry?.email || "U");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: place * 0.1 }}
      className="flex flex-col items-center"
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2",
          `bg-gradient-to-br ${config.bg}`,
        )}
      >
        {entry?.avatar ? (
          <img
            src={entry.avatar}
            alt={entry.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </span>
        )}
      </div>

      <Icon className={cn("w-6 h-6 mb-1", config.iconColor)} />

      <p className="text-sm font-medium truncate max-w-full">{entry?.name}</p>
      <p className="text-xs text-primary-500 font-bold">{entry?.xp || 0} XP</p>

      <div
        className={cn(
          "w-full mt-2 rounded-t-lg bg-gradient-to-b",
          config.bg,
          config.height,
          "opacity-20",
        )}
      />
    </motion.div>
  );
};

// ============================================
// 📊 Leaderboard Row (for virtualized list)
// ============================================

const LeaderboardRow = ({ entry, rank, isCurrentUser, style }) => {
  const avatarColor = getAvatarColor(entry?.name || entry?.email || "");
  const initials = getInitials(entry?.name || entry?.email || "U");
  const rankChange = entry?.rankChange || 0;

  return (
    <div
      style={style}
      className={cn(
        "flex items-center gap-3 px-4 border-b border-neutral-100 dark:border-neutral-800",
        isCurrentUser && "bg-primary-50 dark:bg-primary-950",
      )}
    >
      {/* Rank */}
      <div className="w-10 text-center font-bold text-neutral-500">{rank}</div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
        {entry?.avatar ? (
          <img
            src={entry.avatar}
            alt={entry.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Name and info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {entry?.name}
          {isCurrentUser && (
            <span className="text-xs text-primary-500 mr-2">(شما)</span>
          )}
        </p>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {entry?.xp || 0} XP
          </span>
          {entry?.streak > 0 && (
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {entry.streak}
            </span>
          )}
        </div>
      </div>

      {/* Rank change */}
      {rankChange !== 0 && (
        <div
          className={cn(
            "flex items-center gap-0.5 text-xs",
            rankChange > 0 ? "text-success-500" : "text-danger-500",
          )}
        >
          {rankChange > 0 ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          {Math.abs(rankChange)}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
