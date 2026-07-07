/**
 * AiTutorPage.jsx
 * Path: src/pages/AiTutor/AiTutorPage.jsx
 * Description: AI Tutor page - chat interface with AI
 * Changes:
 * - ✅ FIXED: Added language support (Persian)
 * - ✅ FIXED: Better error handling
 * - ✅ FIXED: messages variable name
 */

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "../../utils/helpers";
import api from "../../services/api";
import toast from "react-hot-toast";

// Message types
const MESSAGE_TYPES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
};

const AiTutorPage = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load conversation history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await api.get("/ai/history");
        if (response.data?.data?.length > 0) {
          const lastConversation = response.data.data[0];
          setConversationId(lastConversation.sessionId);
          setMessages(lastConversation.messages || []);
        } else {
          // Add welcome message in Persian
          const welcomeMessage =
            language === "fa"
              ? "سلام! من معلم هوش مصنوعی آلمانی شما هستم. امروز چطور می‌توانم به شما کمک کنم؟ 🇩🇪"
              : "Hallo! I'm your AI German tutor. How can I help you today? 🇩🇪";

          setMessages([
            {
              id: "welcome",
              type: MESSAGE_TYPES.ASSISTANT,
              content: welcomeMessage,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load conversation history:", error);
        // Add welcome message in Persian
        const welcomeMessage =
          language === "fa"
            ? "سلام! من معلم هوش مصنوعی آلمانی شما هستم. امروز چطور می‌توانم به شما کمک کنم؟ 🇩🇪"
            : "Hallo! I'm your AI German tutor. How can I help you today? 🇩🇪";

        setMessages([
          {
            id: "welcome",
            type: MESSAGE_TYPES.ASSISTANT,
            content: welcomeMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    loadHistory();
  }, [language]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: MESSAGE_TYPES.USER,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: input.trim(),
        sessionId: conversationId || "default",
        level: user?.level || "A1",
        context: {
          nativeLanguage: user?.nativeLanguage || "fa",
          learningGoal: user?.learningGoal || "general",
        },
      });

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        type: MESSAGE_TYPES.ASSISTANT,
        content:
          response.data.data?.response ||
          response.data?.response ||
          (language === "fa"
            ? "متاسفم، نتوانستم پاسخ را پردازش کنم."
            : "Sorry, I couldn't process that."),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.data.data?.sessionId) {
        setConversationId(response.data.data.sessionId);
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      const errorMessage = {
        id: `error-${Date.now()}`,
        type: MESSAGE_TYPES.SYSTEM,
        content:
          language === "fa"
            ? "❌ متاسفم، در ارتباط با سرور مشکل دارم. لطفاً بعداً دوباره تلاش کنید."
            : "❌ Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error(
        language === "fa" ? "خطا در ارسال پیام" : "Failed to send message",
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSuggestions = () => {
    if (language === "fa") {
      return [
        "چگونه سلام کنم؟",
        "اسم من ... است",
        "حالت چطور است؟",
        "این چیست؟",
      ];
    }
    return [
      "Wie heißt du?",
      "Ich heiße...",
      "Wie geht es dir?",
      "Was ist das?",
    ];
  };

  const suggestions = getSuggestions();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === "fa" ? "معلم هوش مصنوعی" : "AI German Tutor"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === "fa"
              ? "با هوش مصنوعی به زبان آلمانی مکالمه کنید"
              : "Practice German conversation with AI"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-700 dark:text-green-300">
            {language === "fa" ? "آنلاین" : "Online"}
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
        {messages.map((message) => {
          const isUser = message.type === MESSAGE_TYPES.USER;
          const isSystem = message.type === MESSAGE_TYPES.SYSTEM;

          if (isSystem) {
            return (
              <div key={message.id} className="flex justify-center my-2">
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full px-4 py-1">
                  {message.content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 mb-4",
                isUser ? "justify-end" : "justify-start",
              )}
            >
              {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  isUser
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700",
                )}
              >
                <p
                  className="whitespace-pre-wrap"
                  dir={language === "fa" ? "rtl" : "ltr"}
                >
                  {message.content}
                </p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString(
                    language === "fa" ? "fa-IR" : "en-US",
                  )}
                </span>
              </div>
              {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                <span className="text-gray-500 dark:text-gray-400">
                  {language === "fa" ? "در حال تایپ..." : "Typing..."}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === "fa"
                ? "پیام خود را به آلمانی بنویسید یا سوال بپرسید..."
                : "Type your message in German or ask a question..."
            }
            className={cn(
              "w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
              language === "fa" ? "text-right" : "text-left",
            )}
            rows={1}
            style={{ minHeight: "52px", maxHeight: "150px" }}
            dir={language === "fa" ? "rtl" : "ltr"}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute bottom-2 p-2 rounded-lg transition-colors",
              language === "fa" ? "left-2" : "right-2",
              input.trim() && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed",
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setInput(suggestion)}
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AiTutorPage;
