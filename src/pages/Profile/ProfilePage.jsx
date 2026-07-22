/**
 * ProfilePage.jsx
 * Path: src/pages/Profile/ProfilePage.jsx
 * Description: User profile page
 * Version: 2.0 - Improved with achievements display, bio, avatar upload
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Camera,
  Trophy,
  Zap,
  Flame,
  Star,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../components/ui/Toast";
import api from "../../services/api";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import AchievementCard from "../../components/AchievementCard";
import ProgressBar from "../../components/ProgressBar";
import { getInitials, getAvatarColor, formatDate } from "../../utils/helpers";

const ProfilePage = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
  });

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [achievementsRes, statsRes] = await Promise.allSettled([
        api.get("/achievements"),
        api.get("/progress/stats"),
      ]);
      if (achievementsRes.status === "fulfilled") {
        setAchievements(achievementsRes.value?.data?.data || []);
      }
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value?.data?.data);
      }
    } catch (err) {
      toast.error("خطا در بارگذاری پروفایل");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSaveProfile = async () => {
    try {
      const response = await api.put("/users/profile", editForm);
      if (response.data.success) {
        updateUser(response.data.data);
        setIsEditing(false);
        toast.success("پروفایل به‌روزرسانی شد");
      }
    } catch (err) {
      toast.error("خطا در به‌روزرسانی پروفایل");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const response = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        updateUser({ ...user, avatar: response.data.data.avatar });
        toast.success("تصویر پروفایل به‌روزرسانی شد");
      }
    } catch (err) {
      toast.error("خطا در آپلود تصویر");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <Skeleton variant="cardLg" />
        <Skeleton variant="card" count={3} />
      </div>
    );
  }

  const avatarColor = getAvatarColor(user?.email || user?.name || "");
  const initials = getInitials(user?.name || user?.email || "U");

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Profile Header */}
      <Card padding="none" className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-accent-500" />
        <div className="px-6 pb-6">
          <div className="flex flex-wrap items-end gap-4 -mt-12">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 object-cover"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 flex items-center justify-center text-3xl font-bold text-white"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
              )}
              <label className="absolute bottom-0 left-0 p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="text-xl font-bold bg-transparent border-b-2 border-primary-500 outline-none"
                />
              ) : (
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user?.name}
                </h1>
              )}
              <p className="text-sm text-neutral-500">@{user?.username}</p>
              <p className="text-xs text-neutral-400 mt-1">
                عضو از {formatDate(user?.createdAt, language)}
              </p>
            </div>
            <Button
              variant={isEditing ? "success" : "secondary"}
              size="sm"
              icon={isEditing ? undefined : Edit}
              onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            >
              {isEditing ? "ذخیره" : "ویرایش"}
            </Button>
          </div>
          <div className="mt-4">
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                placeholder="درباره خودتان بنویسید..."
                rows={3}
                className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
              />
            ) : (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {user?.bio || "هیچ بیوگرافی‌ای ثبت نشده است."}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="XP" value={user?.xp || 0} color="primary" />
        <StatCard
          icon={Star}
          label="سطح"
          value={user?.level || 1}
          color="warning"
        />
        <StatCard
          icon={Flame}
          label="گل‌زنی"
          value={user?.streak || 0}
          color="danger"
        />
        <StatCard
          icon={Trophy}
          label="دستاوردها"
          value={achievements.filter((a) => a.unlocked).length}
          color="success"
        />
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning-500" />
            <h2 className="text-lg font-bold">دستاوردها</h2>
          </div>
        </CardHeader>
        <CardBody>
          {achievements.length === 0 ? (
            <p className="text-center text-neutral-400 py-8">
              هنوز دستاوردی کسب نشده است
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AchievementCard achievement={achievement} compact />
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary-100 dark:bg-primary-950 text-primary-500",
    success: "bg-success-100 dark:bg-success-950 text-success-500",
    warning: "bg-warning-100 dark:bg-warning-950 text-warning-500",
    danger: "bg-danger-100 dark:bg-danger-950 text-danger-500",
  };
  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
};

export default ProfilePage;
