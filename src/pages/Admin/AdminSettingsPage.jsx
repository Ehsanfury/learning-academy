/**
 * AdminAnalyticsPage.jsx
 * Path: src/pages/Admin/AdminAnalyticsPage.jsx
 * Description: آمار بازدید سایت - صفحات پرطرفدار، دستگاه‌ها، مرورگرها
 * Changes:
 * - ✅ FIXED: 500 error handling
 * - ✅ FIXED: Objects are not valid as React child
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import adminApi from "../../services/adminApi";
import { getLocalizedText } from "../../utils/i18n";
import {
  Eye,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Loader2,
} from "lucide-react";
import { useLanguageContext } from "../../context/LanguageContext";
import toast from "react-hot-toast";

function AdminAnalyticsPage() {
  const { language } = useLanguageContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAnalytics(range);
      const responseData = response?.data?.data || response?.data || {};
      setData(responseData);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      toast.error("خطا در بارگذاری آمار بازدید");
      // داده‌های خالی برای نمایش
      const days = parseInt(range.replace("d", ""), 10) || 7;
      const emptyDailyViews = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        emptyDailyViews.push({
          date: date.toISOString().split("T")[0],
          views: 0,
          uniqueVisitors: 0,
        });
      }
      setData({
        totalViews: 0,
        uniqueVisitors: 0,
        memberVisitors: 0,
        guestVisitors: 0,
        dailyViews: emptyDailyViews,
        topPages: [],
        deviceStats: [
          { device: "desktop", count: 0 },
          { device: "mobile", count: 0 },
          { device: "tablet", count: 0 },
          { device: "other", count: 0 },
        ],
        browserStats: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getLocalized = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return getLocalizedText(value, language, "");
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data) return null;

  const ranges = [
    { value: "24h", label: { fa: "۲۴ ساعت", en: "24 hours" } },
    { value: "7d", label: { fa: "۷ روز", en: "7 days" } },
    { value: "30d", label: { fa: "۳۰ روز", en: "30 days" } },
    { value: "90d", label: { fa: "۹۰ روز", en: "90 days" } },
    { value: "1y", label: { fa: "۱ سال", en: "1 year" } },
  ];

  const deviceIcons = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
    other: Globe,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {language === "fa" ? "📊 آمار بازدید سایت" : "📊 Site Analytics"}
          </h2>
          <p className="text-sm text-neutral-500">
            {language === "fa"
              ? "آمار بازدید، دستگاه‌ها و صفحات پرطرفدار"
              : "Visitor statistics, devices and top pages"}
          </p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 text-xs rounded-lg transition ${
                range === r.value
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {getLocalized(r.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
          <Eye className="w-5 h-5 text-primary-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {data.totalViews || 0}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {language === "fa" ? "کل بازدید" : "Total Views"}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
          <Users className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {data.uniqueVisitors || 0}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {language === "fa" ? "بازدیدکننده یکتا" : "Unique Visitors"}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
          <Users className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {data.memberVisitors || 0}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {language === "fa" ? "اعضا" : "Members"}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
          <Globe className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {data.guestVisitors || 0}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {language === "fa" ? "مهمان" : "Guests"}
          </p>
        </div>
      </div>

      {/* Daily Views Chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
          {language === "fa" ? "📈 بازدید روزانه" : "📈 Daily Views"}
        </h3>
        <div className="flex items-end gap-1 h-40">
          {(data.dailyViews || []).map((day, i) => {
            const maxValue = Math.max(
              ...(data.dailyViews || []).map((d) => parseInt(d.views) || 0),
              1,
            );
            const height = Math.max(
              ((parseInt(day.views) || 0) / maxValue) * 100,
              2,
            );
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t flex items-end"
                  style={{ height: "100%" }}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-primary-500 rounded-t w-full"
                  />
                </div>
                <span className="text-2xs text-neutral-400">
                  {day.date
                    ? new Date(day.date).toLocaleDateString(
                        language === "fa" ? "fa-IR" : "en-US",
                        { weekday: "short" },
                      )
                    : ""}
                </span>
              </div>
            );
          })}
        </div>
        {data.dailyViews?.every((d) => d.views === 0) && (
          <p className="text-center text-xs text-neutral-400 mt-2">
            {language === "fa"
              ? "هنوز داده‌ای برای نمایش وجود ندارد"
              : "No data available yet"}
          </p>
        )}
      </div>

      {/* Top Pages & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
            {language === "fa" ? "📄 صفحات پرطرفدار" : "📄 Top Pages"}
          </h3>
          {data.topPages?.length === 0 ? (
            <p className="text-sm text-neutral-400">
              {language === "fa"
                ? "هیچ داده‌ای موجود نیست"
                : "No data available"}
            </p>
          ) : (
            <div className="space-y-2">
              {(data.topPages || []).slice(0, 10).map((page, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400 w-6">#{i + 1}</span>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300 flex-1 truncate">
                    {page.path || "/"}
                  </span>
                  <span className="text-sm font-medium text-primary-500">
                    {page.views || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
            {language === "fa" ? "📱 دستگاه‌ها" : "📱 Devices"}
          </h3>
          {data.deviceStats?.length === 0 ||
          data.deviceStats?.every((d) => d.count === 0) ? (
            <p className="text-sm text-neutral-400">
              {language === "fa"
                ? "هیچ داده‌ای موجود نیست"
                : "No data available"}
            </p>
          ) : (
            <div className="space-y-3">
              {(data.deviceStats || []).map((device) => {
                const Icon = deviceIcons[device.device] || Globe;
                const total =
                  (data.deviceStats || []).reduce(
                    (sum, d) => sum + parseInt(d.count || 0),
                    0,
                  ) || 1;
                const percentage = Math.max(
                  (parseInt(device.count || 0) / total) * 100,
                  0,
                );
                return (
                  <div key={device.device} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 w-20 capitalize">
                      {device.device || "other"}
                    </span>
                    <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-primary-500 h-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 w-16 text-right">
                      {device.count || 0} ({Math.round(percentage)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Browsers */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
          {language === "fa" ? "🌐 مرورگرها" : "🌐 Browsers"}
        </h3>
        {data.browserStats?.length === 0 ? (
          <p className="text-sm text-neutral-400">
            {language === "fa" ? "هیچ داده‌ای موجود نیست" : "No data available"}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(data.browserStats || []).map((browser) => (
              <div
                key={browser.browser}
                className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
              >
                <p className="text-lg font-bold text-neutral-900 dark:text-white">
                  {browser.count || 0}
                </p>
                <p className="text-xs text-neutral-400">
                  {browser.browser || "Unknown"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
