/**
 * AdminMentorsPage.jsx
 * مدیریت منتورها
 */

import { useState, useEffect } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import {
  Search,
  RefreshCw,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

function AdminMentorsPage() {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/mentors");
      setMentors(response?.data?.data || response?.data || []);
    } catch (error) {
      toast.error("خطا در بارگذاری منتورها");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, isVerified) => {
    try {
      await api.put(`/admin/mentors/${id}/verify`, { isVerified: !isVerified });
      toast.success("وضعیت منتور به‌روزرسانی شد");
      loadMentors();
    } catch (error) {
      toast.error("خطا در بروزرسانی منتور");
    }
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
          {language === "fa" ? "مدیریت منتورها" : "Mentors Management"}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              language === "fa" ? "جستجوی منتور..." : "Search mentors..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <button
          onClick={loadMentors}
          className="p-2 border rounded-lg hover:bg-gray-100"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {mentors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {language === "fa" ? "هیچ منتوری یافت نشد" : "No mentors found"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3">نام</th>
                  <th className="text-left px-4 py-3">ایمیل</th>
                  <th className="text-center px-4 py-3">سطح</th>
                  <th className="text-center px-4 py-3">تأیید</th>
                  <th className="text-center px-4 py-3">وضعیت</th>
                  <th className="text-center px-4 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {mentors.map((mentor) => (
                  <tr
                    key={mentor.id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-3 font-medium">{mentor.name}</td>
                    <td className="px-4 py-3 text-gray-500">{mentor.email}</td>
                    <td className="px-4 py-3 text-center">{mentor.level}</td>
                    <td className="px-4 py-3 text-center">
                      {mentor.isVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-yellow-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${mentor.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {mentor.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          handleVerify(mentor.id, mentor.isVerified)
                        }
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        {mentor.isVerified ? "لغو تأیید" : "تأیید"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMentorsPage;
