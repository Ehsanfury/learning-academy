/**
 * AiTutorPage.jsx
 * Path: src/pages/AiTutor/AiTutorPage.jsx
 * Description: AI Tutor with memory cleanup on refresh/login
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import api from "@services/api";
import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Settings,
  Mic,
  BookOpen,
  GraduationCap,
  Languages,
  MessageSquare,
  AlertCircle,
  WifiOff,
} from "lucide-react";
import toast from "react-hot-toast";

// ============================================
// 📊 Constants
// ============================================

const MAX_MESSAGES = 20;
const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const modes = [
  { id: "tutor", label: { fa: "معلم", en: "Tutor" }, icon: GraduationCap },
  {
    id: "conversation",
    label: { fa: "مکالمه", en: "Conversation" },
    icon: MessageSquare,
  },
  { id: "grammar", label: { fa: "گرامر", en: "Grammar" }, icon: BookOpen },
];

// ============================================
// 📚 AiTutorPage Component
// ============================================

const AiTutorPage = () => {
  const { user, logout } = useAuth();
  const { language } = useLanguageContext();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [selectedMode, setSelectedMode] = useState("tutor");
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [retryMessageId, setRetryMessageId] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionIdRef = useRef(null);

  // ============================================
  // 🆕 Generate Session ID
  // ============================================

  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }, []);

  // ============================================
  // 🧹 Clear Memory on Mount/Login
  // ============================================

  useEffect(() => {
    const cleanup = () => {
      sessionIdRef.current = null;
      const newSessionId = generateSessionId();
      sessionIdRef.current = newSessionId;
      setSessionId(newSessionId);
      setMessages([]);
      setError(null);
      setRetryMessageId(null);
    };

    cleanup();

    return () => {
      sessionIdRef.current = null;
      setMessages([]);
    };
  }, [generateSessionId]);

  useEffect(() => {
    const newSessionId = generateSessionId();
    sessionIdRef.current = newSessionId;
    setSessionId(newSessionId);
    setMessages([]);
    setError(null);
    setIsFirstLoad(true);
  }, [user?.id, generateSessionId]);

  // ============================================
  // 📥 Load Welcome Message
  // ============================================

  useEffect(() => {
    if (isFirstLoad && !messages.length) {
      setMessages([
        {
          id: "welcome",
          sender: "assistant",
          message:
            language === "fa"
              ? "👋 سلام! من معلم هوش مصنوعی آلمانی هستم. هر سوالی داری، از من بپرس! (حافظه من با هر بار ورود تازه می‌شود)"
              : "👋 Hello! I'm your German AI tutor. Ask me anything! (My memory resets on each visit)",
          timestamp: new Date().toISOString(),
          status: "sent",
        },
      ]);
      setIsFirstLoad(false);
    }
  }, [language, isFirstLoad, messages.length]);

  // ============================================
  // 📤 Scroll to Bottom
  // ============================================

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  // ============================================
  // 📤 Send Message - ✅ FIXED: مسیر API درست
  // ============================================

  const sendMessage = async (retryMessage = null) => {
    const messageToSend = retryMessage || input.trim();
    if (!messageToSend || sending) return;

    if (retryMessage) {
      setMessages((prev) => prev.filter((m) => m.id !== retryMessageId));
      setRetryMessageId(null);
    }

    const userMessage = messageToSend;
    if (!retryMessage) {
      setInput("");
    }

    setSending(true);
    setError(null);

    const tempUserMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      message: userMessage,
      timestamp: new Date().toISOString(),
      status: "sending",
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    const tempAiMessage = {
      id: `ai-${Date.now()}`,
      sender: "assistant",
      message: "در حال پردازش...",
      timestamp: new Date().toISOString(),
      status: "loading",
      xpGained: 0,
    };
    setMessages((prev) => [...prev, tempAiMessage]);

    try {
      // ✅ FIXED: مسیر درست API
      const response = await api.post("/ai/chat", {
        message: userMessage,
        level: selectedLevel,
        context: { role: selectedMode },
        sessionId: sessionIdRef.current || sessionId,
      });

      const aiResponse =
        response?.data?.response ||
        response?.response ||
        "متأسفانه پاسخی دریافت نشد.";
      const xpGained = response?.data?.xpGained || response?.xpGained || 0;

      setMessages((prev) => {
        let updated = prev.map((m) =>
          m.id === tempUserMessage.id ? { ...m, status: "sent" } : m,
        );
        updated = updated.map((m) =>
          m.id === tempAiMessage.id
            ? { ...m, message: aiResponse, xpGained, status: "sent" }
            : m,
        );

        if (updated.length > MAX_MESSAGES) {
          const welcome = updated.find((m) => m.id === "welcome");
          const recent = updated.slice(-MAX_MESSAGES + 1);
          updated = welcome ? [welcome, ...recent] : recent;
        }

        return updated;
      });

      if (xpGained > 0) {
        toast.success(`+${xpGained} XP`);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.userMessage ||
        "خطا در ارسال پیام";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempUserMessage.id ? { ...m, status: "error" } : m,
        ),
      );

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAiMessage.id
            ? { ...m, message: errorMessage, status: "error", error: true }
            : m,
        ),
      );

      setError(errorMessage);
      setRetryMessageId(tempUserMessage.id);
    } finally {
      setSending(false);
    }
  };

  // ============================================
  // 🗑️ Clear History
  // ============================================

  const clearHistory = async () => {
    if (!confirm(language === "fa" ? "آیا مطمئن هستید؟" : "Are you sure?"))
      return;

    try {
      await api.delete(`/ai/history/${sessionId}`);

      setMessages([
        {
          id: "welcome",
          sender: "assistant",
          message:
            language === "fa"
              ? "🧹 تاریخچه پاک شد! دوباره شروع کنیم؟"
              : "🧹 History cleared! Let's start fresh?",
          timestamp: new Date().toISOString(),
          status: "sent",
        },
      ]);
      setError(null);
      setRetryMessageId(null);

      const newSessionId = generateSessionId();
      sessionIdRef.current = newSessionId;
      setSessionId(newSessionId);

      toast.success(language === "fa" ? "تاریخچه پاک شد" : "History cleared");
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("خطا در پاک کردن تاریخچه");
    }
  };

  // ============================================
  // 🛠️ Utility Functions
  // ============================================

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(language === "fa" ? "کپی شد!" : "Copied!");
  };

  const playAudio = (text) => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-950 rounded-xl">
            <Bot className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {language === "fa" ? "🤖 معلم هوش مصنوعی" : "🤖 AI Tutor"}
            </h1>
            <p className="text-xs text-neutral-500">
              {language === "fa"
                ? `سطح ${selectedLevel} • ${modes.find((m) => m.id === selectedMode)?.label[language]}`
                : `Level ${selectedLevel} • ${modes.find((m) => m.id === selectedMode)?.label[language]}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Settings className="w-5 h-5 text-neutral-500" />
          </button>
          <button
            onClick={clearHistory}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Trash2 className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
      </div>

      {/* Memory Info */}
      <div className="mb-2 text-xs text-neutral-400 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {language === "fa"
          ? `🧹 حافظه تازه • ${messages.length} پیام`
          : `🧹 Fresh memory • ${messages.length} messages`}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {language === "fa" ? "سطح" : "Level"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        selectedLevel === level
                          ? "bg-primary-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {language === "fa" ? "حالت" : "Mode"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {modes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          selectedMode === mode.id
                            ? "bg-primary-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {mode.label[language]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
          {retryMessageId && (
            <button
              onClick={() => {
                const msg = messages.find((m) => m.id === retryMessageId);
                if (msg) sendMessage(msg.message);
              }}
              className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 transition"
            >
              {language === "fa" ? "تلاش مجدد" : "Retry"}
            </button>
          )}
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === "user"
                  ? "bg-primary-100 dark:bg-primary-900"
                  : "bg-neutral-100 dark:bg-neutral-800"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : (
                <Bot className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              )}
            </div>

            <div
              className={`flex-1 max-w-[80%] ${
                msg.sender === "user" ? "text-right" : ""
              }`}
            >
              <div
                className={`p-4 rounded-xl ${
                  msg.sender === "user"
                    ? "bg-primary-500 text-white"
                    : msg.status === "error"
                      ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                      : msg.status === "loading"
                        ? "bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                        : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                }`}
              >
                {msg.status === "loading" ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                    <span className="text-sm text-neutral-500">
                      {language === "fa" ? "در حال نوشتن..." : "Typing..."}
                    </span>
                  </div>
                ) : (
                  <p
                    className={`text-sm whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "text-white"
                        : msg.status === "error"
                          ? "text-red-600 dark:text-red-400"
                          : "text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    {msg.message}
                  </p>
                )}
              </div>

              <div
                className={`flex items-center gap-2 mt-1 ${
                  msg.sender === "user" ? "justify-start" : ""
                }`}
              >
                <span className="text-xs text-neutral-400">
                  {formatTime(msg.timestamp)}
                </span>
                {msg.xpGained > 0 && (
                  <span className="text-xs text-amber-500">
                    +{msg.xpGained} XP
                  </span>
                )}
                {msg.sender === "user" && msg.status === "error" && (
                  <button
                    onClick={() => {
                      setRetryMessageId(msg.id);
                      sendMessage(msg.message);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {language === "fa" ? "تلاش مجدد" : "Retry"}
                  </button>
                )}
                {msg.sender === "assistant" && msg.status === "sent" && (
                  <>
                    <button
                      onClick={() => copyMessage(msg.message)}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-neutral-400" />
                      )}
                    </button>
                    <button
                      onClick={() => playAudio(msg.message)}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    >
                      <Volume2 className="w-3 h-3 text-neutral-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === "fa"
                ? "پیام خود را بنویسید... (Ctrl+Enter برای ارسال)"
                : "Type your message... (Ctrl+Enter to send)"
            }
            rows={1}
            disabled={sending}
            className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition min-h-[52px] max-h-[150px] disabled:opacity-50"
            style={{ height: "auto" }}
          />
        </div>
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || sending}
          className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AiTutorPage;
