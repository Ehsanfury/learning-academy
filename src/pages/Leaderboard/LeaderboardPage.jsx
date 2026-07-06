/**
 * LeaderboardPage.jsx
 * Path: src/pages/Leaderboard/LeaderboardPage.jsx
 * Description: Leaderboard page with virtualization
 * Changes:
 * - ✅ FIXED: Replaced userApi with direct api calls
 * - ✅ FIXED: Added cn import
 * - ✅ Added proper error handling
 * - ✅ M28: Added react-window for virtualization
 * - ✅ M2: Removed email from leaderboard display
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FixedSizeList as List } from "react-window";
import { Trophy, Medal, Star, TrendingUp, Users } from "lucide-react";
import api from "@services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Button from "../../components/ui/Button";
import { cn } from "../../utils/cn";
import debug from "../../utils/debug";

// Leaderboard item height
const ITEM_HEIGHT = 70;

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [type, setType] = useState("xp");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/users/leaderboard", {
        params: { type, limit, page },
      });

      if (response.data?.success) {
        const data = response.data.data || response.data;
        setLeaderboard(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.total || 0);
      } else if (response.data) {
        setLeaderboard(response.data || []);
      }
    } catch (error) {
      debug.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [type, page]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Get rank badge
  const getRankBadge = (rank) => {
    if (rank === 1) return <Medal className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return (
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        #{rank}
      </span>
    );
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "xp":
        return <Star className="w-5 h-5" />;
      case "level":
        return <Trophy className="w-5 h-5" />;
      case "streak":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  // Row renderer for virtualization
  const Row = ({ index, style }) => {
    const item = leaderboard[index];
    if (!item) return null;

    const isCurrentUser = item.id === "current-user-id"; // Replace with actual user check

    return (
      <div
        style={style}
        className={cn(
          "flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800",
          isCurrentUser && "bg-indigo-50 dark:bg-indigo-900/20",
        )}
      >
        <div className="w-12 flex-shrink-0 text-center">
          {getRankBadge(item.rank)}
        </div>

        <div className="flex-1 flex items-center gap-3">
          <img
            src={item.avatar || "/default-avatar.png"}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover"
            loading="lazy"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {item.name}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                  (You)
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Level {item.level} • {item.xp} XP
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-bold text-indigo-600 dark:text-indigo-400">
            {type === "xp" && `${item.xp} XP`}
            {type === "level" && `Level ${item.level}`}
            {type === "streak" && `${item.streak} days`}
          </p>
        </div>
      </div>
    );
  };

  // Pagination controls
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-gray-500">{totalUsers} users ranked</p>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["xp", "level", "streak"].map((t) => (
          <Button
            key={t}
            variant={type === t ? "primary" : "outline"}
            size="sm"
            onClick={() => {
              setType(t);
              setPage(1);
            }}
            icon={getTypeIcon(t)}
            iconPosition="left"
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {/* Leaderboard list with virtualization */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {leaderboard.length > 0 ? (
          <List
            height={Math.min(leaderboard.length * ITEM_HEIGHT, 500)}
            itemCount={leaderboard.length}
            itemSize={ITEM_HEIGHT}
            width="100%"
          >
            {Row}
          </List>
        ) : (
          <div className="py-12 text-center text-gray-500">
            No users found on the leaderboard.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default LeaderboardPage;
