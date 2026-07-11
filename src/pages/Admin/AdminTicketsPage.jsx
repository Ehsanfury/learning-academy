/**
 * AdminTicketsPage.jsx
 * مدیریت تیکت‌های پشتیبانی
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import adminApi from "../../services/adminApi";
import { Search, Send, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useLanguageContext } from "../../context/LanguageContext";

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
      setTickets(response.data || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminApi.getTicketStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
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
    urgent: "bg-danger-500",
    high: "bg-warning-500",
    medium: "bg-primary-500",
    low: "bg-neutral-400",
  };

  const statusColors = {
    open: "bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400",
    pending:
      "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
    answered:
      "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
    resolved:
      "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
    closed: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {language === "fa" ? "تیکت‌های پشتیبانی" : "Support Tickets"}
        </h2>
        {stats && (
          <div className="flex gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
              {stats.unresolved || 0}{" "}
              {language === "fa" ? "حل‌نشده" : "Unresolved"}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
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
          className="flex-1 min-w-[200px] px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
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
          className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
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
        {loading ? (
          <div className="text-center py-8 text-neutral-400">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            {language === "fa" ? "تیکتی وجود ندارد" : "No tickets"}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${priorityColors[ticket.priority]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-neutral-900 dark:text-white text-sm">
                        {ticket.subject}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate">
                      {ticket.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-neutral-400">
                        {ticket.user?.name}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {ticket.user?.email}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                {selectedTicket.subject}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedTicket.status]}`}
              >
                {selectedTicket.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="text-xs text-neutral-400">
                <span>
                  From: {selectedTicket.user?.name} (
                  {selectedTicket.user?.email})
                </span>
                <br />
                <span>Category: {selectedTicket.category}</span> |{" "}
                <span>Priority: {selectedTicket.priority}</span>
                <br />
                <span>
                  Date: {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {selectedTicket.message}
                </p>
              </div>

              {selectedTicket.adminReply && (
                <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <p className="text-xs text-primary-500 font-medium mb-1">
                    Admin Reply:
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
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleStatusChange(selectedTicket.id, "resolved")
                  }
                  className="px-3 py-2 text-xs rounded-lg bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400"
                >
                  <CheckCircle className="w-3 h-3 inline mr-1" /> Mark Resolved
                </button>
                <button
                  onClick={() =>
                    handleStatusChange(selectedTicket.id, "closed")
                  }
                  className="px-3 py-2 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                >
                  Close
                </button>
                <button
                  onClick={handleReply}
                  disabled={!reply.trim()}
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-primary-500 text-white disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />{" "}
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
