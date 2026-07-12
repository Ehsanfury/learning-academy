/**
 * AdminTicketsPage.jsx
 * Path: src/pages/Admin/AdminTicketsPage.jsx
 * Description: مدیریت تیکت‌های پشتیبانی
 * Changes:
 * - ✅ FIXED: tickets.map is not a function - proper data unwrapping
 * - ✅ FIXED: Error handling for API responses
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import adminApi from "../../services/adminApi";
import { Search, Send, AlertCircle, CheckCircle, Clock, X } from "lucide-react";
import { useLanguageContext } from "../../context/LanguageContext";
import LoadingSpinner from "../../components/LoadingSpinner";

function AdminTicketsPage() {
  const { language } = useLanguageContext();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [filterStatus, filterPriority, search]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (search) params.search = search;

      const response = await adminApi.getTickets(params);

      // ✅ FIXED: Proper data unwrapping
      let ticketsData = [];
      if (response?.data?.data) {
        ticketsData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        ticketsData = response.data;
      } else if (Array.isArray(response)) {
        ticketsData = response;
      }

      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminApi.getTicketStats();
      // ✅ FIXED: Proper data unwrapping
      const statsData = response?.data?.data || response?.data || {};
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setStats(null);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    try {
      await adminApi.replyTicket(selectedTicket.id, reply, "answered");
      setReply("");
      setSelectedTicket(null);
      loadTickets();
      loadStats();
    } catch (err) {
      console.error("Failed to reply:", err);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await adminApi.updateTicketStatus(ticketId, { status: newStatus });
      loadTickets();
      loadStats();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const priorityColors = {
    urgent: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-blue-500",
    low: "bg-gray-400",
  };

  const statusColors = {
    open: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    pending:
      "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    answered:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    resolved:
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    closed: "bg-gray-100 text-gray-500 dark:bg-gray-800",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {language === "fa" ? "تیکت‌های پشتیبانی" : "Support Tickets"}
        </h2>
        {stats && (
          <div className="flex gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {stats.unresolved || 0}{" "}
              {language === "fa" ? "حل‌نشده" : "Unresolved"}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
              {stats.total || 0} {language === "fa" ? "کل" : "Total"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder={
            language === "fa" ? "جستجو در تیکت‌ها..." : "Search tickets..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">
            {language === "fa" ? "همه وضعیت‌ها" : "All status"}
          </option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="answered">Answered</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">
            {language === "fa" ? "همه اولویت‌ها" : "All priority"}
          </option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            {language === "fa" ? "تیکتی وجود ندارد" : "No tickets"}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 cursor-pointer transition"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${priorityColors[ticket.priority] || "bg-gray-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-neutral-900 dark:text-white text-sm">
                        {ticket.subject || "بدون موضوع"}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status] || "bg-gray-100 text-gray-500"}`}
                      >
                        {ticket.status || "open"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate">
                      {ticket.message || ""}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-neutral-400">
                        {ticket.user?.name || "کاربر"}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {ticket.user?.email || ""}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {ticket.category || "general"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {selectedTicket.subject || "بدون موضوع"}
              </h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="text-xs text-neutral-400">
                <span>
                  از: {selectedTicket.user?.name || "کاربر"} (
                  {selectedTicket.user?.email || ""})
                </span>
                <br />
                <span>دسته: {selectedTicket.category || "general"}</span> |{" "}
                <span>اولویت: {selectedTicket.priority || "medium"}</span>
                <br />
                <span>
                  تاریخ:{" "}
                  {selectedTicket.createdAt
                    ? new Date(selectedTicket.createdAt).toLocaleString()
                    : ""}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {selectedTicket.message || ""}
                </p>
              </div>

              {selectedTicket.adminReply && (
                <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <p className="text-xs text-primary-500 font-medium mb-1">
                    پاسخ ادمین:
                  </p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {selectedTicket.adminReply}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={
                  language === "fa" ? "پاسخ به کاربر..." : "Reply to user..."
                }
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    handleStatusChange(selectedTicket.id, "resolved")
                  }
                  className="px-3 py-2 text-xs rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 transition"
                >
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  {language === "fa" ? "حل شد" : "Resolve"}
                </button>
                <button
                  onClick={() =>
                    handleStatusChange(selectedTicket.id, "closed")
                  }
                  className="px-3 py-2 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 transition"
                >
                  <X className="w-3 h-3 inline mr-1" />
                  {language === "fa" ? "بستن" : "Close"}
                </button>
                <button
                  onClick={handleReply}
                  disabled={!reply.trim()}
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-primary-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary-600 transition"
                >
                  <Send className="w-4 h-4" />
                  {language === "fa" ? "ارسال پاسخ" : "Send Reply"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminTicketsPage;
