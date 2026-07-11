/**
 * AdminAnalyticsPage.jsx
 * آمار بازدید سایت — صفحات پرطرفدار، دستگاه‌ها، مرورگرها
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import adminApi from "../../services/adminApi";
import { Eye, Users, Monitor, Smartphone, Tablet, Globe } from "lucide-react";
import { useLanguageContext } from "../../context/LanguageContext";

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
      setData(response.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center py-12 text-neutral-500">Loading...</div>;
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {language === "fa" ? "آمار بازدید سایت" : "Site Analytics"}
        </h2>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 text-xs rounded-lg ${range === r.value ? "bg-primary-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"}`}
            >
              {r.label[language]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
          <Eye className="w-5 h-5 text-primary-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {data.totalViews}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {language === "fa" ? "کل بازدید" : "Total Views"}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
          <Users className="w-5 h-5 text-success-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {data.uniqueVisitors}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {language === "fa" ? "بازدیدکننده یکتا" : "Unique Visitors"}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
          <Users className="w-5 h-5 text-accent-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {data.memberVisitors}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {language === "fa" ? "اعضا" : "Members"}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
          <Globe className="w-5 h-5 text-warning-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {data.guestVisitors}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {language === "fa" ? "مهمان" : "Guests"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
          {language === "fa" ? "بازدید روزانه" : "Daily Views"}
        </h3>
        <div className="flex items-end gap-1 h-40">
          {data.dailyViews?.map((day, i) => {
            const maxValue = Math.max(
              ...data.dailyViews.map((d) => parseInt(d.views)),
              1,
            );
            const height = (parseInt(day.views) / maxValue) * 100;
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
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
            {language === "fa" ? "صفحات پرطرفدار" : "Top Pages"}
          </h3>
          <div className="space-y-2">
            {data.topPages?.slice(0, 10).map((page, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-neutral-400 w-6">#{i + 1}</span>
                <span className="text-sm text-neutral-700 dark:text-neutral-300 flex-1 truncate">
                  {page.path}
                </span>
                <span className="text-sm font-medium text-primary-500">
                  {page.views}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
            {language === "fa" ? "دستگاه‌ها" : "Devices"}
          </h3>
          <div className="space-y-3">
            {data.deviceStats?.map((device) => {
              const Icon = deviceIcons[device.device] || Globe;
              const total =
                data.deviceStats.reduce(
                  (sum, d) => sum + parseInt(d.count),
                  0,
                ) || 1;
              const percentage = (parseInt(device.count) / total) * 100;
              return (
                <div key={device.device} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300 w-20 capitalize">
                    {device.device || "other"}
                  </span>
                  <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-primary-500 h-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-400 w-16 text-left">
                    {device.count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
          {language === "fa" ? "مرورگرها" : "Browsers"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.browserStats?.map((browser) => (
            <div
              key={browser.browser}
              className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
            >
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {browser.count}
              </p>
              <p className="text-xs text-neutral-400">{browser.browser}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
