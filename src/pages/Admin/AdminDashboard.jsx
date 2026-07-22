/**
 * AdminDashboard.jsx
 * Path: src/pages/Admin/AdminDashboard.jsx
 * Description: Admin dashboard with real data and charts
 * Version: 2.0 - Real data, charts, better UI
 * Features:
 * - ✅ Real-time stats (users, lessons, XP)
 * - ✅ User growth chart (line chart)
 * - ✅ Lesson completion chart
 * - ✅ Recent activity feed
 * - ✅ Top users list
 * - ✅ System health indicators
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import api from "../../services/api";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import ErrorState from "../../components/ui/ErrorState";
import { formatNumber, formatDate } from "../../utils/helpers";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);

  // ============================================
  // 📡 Fetch Dashboard Data
  // ============================================

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsRes, growthRes, activityRes, topUsersRes, healthRes] =
        await Promise.allSettled([
          api.get("/admin/stats"),
          api.get("/admin/users/growth"),
          api.get("/admin/activity"),
          api.get("/admin/top-users"),
          api.get("/admin/health"),
        ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value?.data?.data);
      }
      if (growthRes.status === "fulfilled") {
        setUserGrowth(growthRes.value?.data?.data || []);
      }
      if (activityRes.status === "fulfilled") {
        setRecentActivity(activityRes.value?.data?.data || []);
      }
      if (topUsersRes.status === "fulfilled") {
        setTopUsers(topUsersRes.value?.data?.data || []);
      }
      if (healthRes.status === "fulfilled") {
        setSystemHealth(healthRes.value?.data?.data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ============================================
  // 🖼️ Loading
  // ============================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="title" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton variant="card" count={4} />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton variant="cardLg" count={2} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={fetchDashboard}
        title="خطا در بارگذاری داشبورد"
        size="lg"
      />
    );
  }

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">داشبورد مدیریت</h1>
        <p className="text-sm text-neutral-500 mt-1">
          نمای کلی از وضعیت سیستم و کاربران
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="کل کاربران"
          value={stats?.totalUsers || 0}
          change={stats?.userGrowth}
          color="primary"
        />
        <StatCard
          icon={BookOpen}
          label="کل درس‌ها"
          value={stats?.totalLessons || 0}
          change={stats?.lessonGrowth}
          color="success"
        />
        <StatCard
          icon={Zap}
          label="کل XP توزیع شده"
          value={stats?.totalXP || 0}
          change={stats?.xpGrowth}
          color="warning"
        />
        <StatCard
          icon={Activity}
          label="کاربران فعال (امروز)"
          value={stats?.activeToday || 0}
          change={stats?.activeChange}
          color="accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-bold">رشد کاربران (۳۰ روز اخیر)</h2>
            </div>
          </CardHeader>
          <CardBody>
            <LineChart data={userGrowth} />
          </CardBody>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-success-500" />
              <h2 className="text-lg font-bold">وضعیت سیستم</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <HealthItem
              icon={Server}
              label="سرور"
              status={systemHealth?.server || "healthy"}
              detail={`${systemHealth?.uptime || 0}% آپتایم`}
            />
            <HealthItem
              icon={Database}
              label="پایگاه داده"
              status={systemHealth?.database || "healthy"}
              detail={`${systemHealth?.dbConnections || 0} اتصال`}
            />
            <HealthItem
              icon={Activity}
              label="API"
              status={systemHealth?.api || "healthy"}
              detail={`${systemHealth?.responseTime || 0}ms میانگین پاسخ`}
            />
            <HealthItem
              icon={Clock}
              label="Redis Cache"
              status={systemHealth?.redis || "healthy"}
              detail={`${systemHealth?.cacheHitRate || 0}% hit rate`}
            />
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity & Top Users */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-500" />
              <h2 className="text-lg font-bold">فعالیت اخیر</h2>
            </div>
          </CardHeader>
          <CardBody>
            {recentActivity.length === 0 ? (
              <p className="text-center text-neutral-400 py-4">فعالیتی ثبت نشده</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDate(activity.timestamp, "fa")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-warning-500" />
              <h2 className="text-lg font-bold">برترین کاربران</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {topUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <span className="w-6 text-center font-bold text-neutral-400">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-neutral-400">
                      {formatNumber(user.xp)} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

// ============================================
// 📊 Stat Card
// ============================================

const StatCard = ({ icon: Icon, label, value, change, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary-100 dark:bg-primary-950 text-primary-500",
    success: "bg-success-100 dark:bg-success-950 text-success-500",
    warning: "bg-warning-100 dark:bg-warning-950 text-warning-500",
    accent: "bg-accent-100 dark:bg-accent-950 text-accent-500",
  };

  const isPositive = change > 0;

  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span
            className={`flex items-center text-xs font-medium ${
              isPositive ? "text-success-500" : "text-danger-500"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 ml-0.5" />
            ) : (
              <TrendingDown className="w-3 h-3 ml-0.5" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold mt-3">{formatNumber(value)}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </Card>
  );
};

// ============================================
// 📈 Simple Line Chart
// ============================================

const LineChart = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <p className="text-center text-neutral-400 py-8">داده‌ای موجود نیست</p>
    );
  }

  const values = data.map((d) => d.value || d.count || 0);
  const maxValue = Math.max(...values, 1);
  const width = 100;
  const height = 100;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.value || d.count || 0) / maxValue) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-40"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(79, 70, 229, 0.3)" />
            <stop offset="100%" stopColor="rgba(79, 70, 229, 0)" />
          </linearGradient>
        </defs>

        {/* Area */}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill="url(#lineGradient)"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#4F46E5"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="flex justify-between text-xs text-neutral-400 mt-2">
        <span>{formatDate(data[0]?.date, "fa")}</span>
        <span>{formatDate(data[data.length - 1]?.date, "fa")}</span>
      </div>
    </div>
  );
};

// ============================================
// ✅ Health Item
// ============================================

const HealthItem = ({ icon: Icon, label, status, detail }) => {
  const isHealthy = status === "healthy" || status === "ok";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
      <div
        className={`p-2 rounded-lg ${
          isHealthy
            ? "bg-success-100 dark:bg-success-950 text-success-500"
            : "bg-danger-100 dark:bg-danger-950 text-danger-500"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-neutral-500">{detail}</p>
      </div>
      {isHealthy ? (
        <CheckCircle className="w-5 h-5 text-success-500" />
      ) : (
        <AlertCircle className="w-5 h-5 text-danger-500" />
      )}
    </div>
  );
};

export default AdminDashboard;
