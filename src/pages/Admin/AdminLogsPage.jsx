/**
 * AdminLogsPage.jsx
 * مشاهده لاگ‌های سیستم
 */

import { useState, useEffect } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import { Search, RefreshCw, Loader2, FileText, Download } from "lucide-react";
import toast from "react-hot-toast";

function AdminLogsPage() {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/logs", {
        params: { level: filter },
      });
      setLogs(response?.data?.data || response?.data || []);
    } catch (error) {
      toast.error("خطا در بارگذاری لاگ‌ها");
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      error: "bg-red-100 text-red-700",
      warn: "bg-yellow-100 text-yellow-700",
      info: "bg-blue-100 text-blue-700",
      debug: "bg-gray-100 text-gray-700",
    };
    return colors[level] || colors.info;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {language === "fa" ? "لاگ‌های سیستم" : "System Logs"}
        </h2>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg flex items-center gap-2 hover:bg-primary-600">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              language === "fa" ? "جستجو در لاگ‌ها..." : "Search logs..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="all">{language === "fa" ? "همه" : "All"}</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
        <button
          onClick={loadLogs}
          className="p-2 border rounded-lg hover:bg-gray-100"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3">زمان</th>
                <th className="text-left px-4 py-3">سطح</th>
                <th className="text-left px-4 py-3">پیام</th>
                <th className="text-left px-4 py-3">مسیر</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getLevelColor(log.level)}`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {log.message}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {log.path || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminLogsPage;
