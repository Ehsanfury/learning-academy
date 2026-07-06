/**
 * DictionaryPage.jsx - Version 7.0
 * Path: src/pages/Dictionary/DictionaryPage.jsx
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import api from "@services/api";
import {
  AlertCircle,
  RefreshCw,
  Search,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Volume2,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";
import Skeleton from "@components/ui/Skeleton";

const DictionaryPage = () => {
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedWords, setSavedWords] = useState([]);
  const [filter, setFilter] = useState("all");
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    loadWords();
    loadSavedWords();
  }, []);

  const getLocalized = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[language] || obj.fa || obj.en || "";
  };

  const loadWords = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ استفاده مستقیم از api
      const response = await api.get("/dictionary");

      let wordsData = [];
      let total = 0;

      if (response?.data?.data && Array.isArray(response.data.data)) {
        wordsData = response.data.data;
        total = response.data.total || wordsData.length;
      } else if (Array.isArray(response?.data)) {
        wordsData = response.data;
        total = wordsData.length;
      }

      setWords(wordsData);
      setTotalWords(total);
    } catch (error) {
      console.error("Error loading dictionary:", error);
      setError(error.message || "خطا در بارگذاری دیکشنری");
      toast.error("خطا در بارگذاری دیکشنری");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedWords = async () => {
    try {
      const response = await api.get("/dictionary/saved-words");
      const savedData = response?.data?.data || response?.data || [];
      setSavedWords(Array.isArray(savedData) ? savedData : []);
    } catch (error) {
      console.warn("Could not load saved words:", error);
      setSavedWords([]);
    }
  };

  const isWordSaved = (wordId) => savedWords.some((w) => w.id === wordId);

  const toggleSaveWord = async (word) => {
    try {
      if (isWordSaved(word.id)) {
        await api.delete(`/dictionary/saved-words/${word.id}`);
        setSavedWords(savedWords.filter((w) => w.id !== word.id));
        toast.success("لغت از لیست ذخیره شده حذف شد");
      } else {
        await api.post("/dictionary/saved-words", { wordId: word.id });
        setSavedWords([...savedWords, word]);
        toast.success("لغت به لیست ذخیره شده اضافه شد");
      }
    } catch (error) {
      console.error("Error toggling saved word:", error);
      toast.error("خطا در ذخیره لغت");
    }
  };

  const speakWord = (word) => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "de-DE";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredWords = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return words.filter((word) => {
      const matchesSearch =
        word.de?.toLowerCase().includes(searchLower) ||
        word.fa?.toLowerCase().includes(searchLower) ||
        word.en?.toLowerCase().includes(searchLower);
      const matchesFilter = filter === "all" || word.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [words, searchTerm, filter]);

  const categories = useMemo(() => {
    const cats = ["all", ...new Set(words.map((w) => w.category))];
    return cats.filter(Boolean);
  }, [words]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton variant="title" className="w-48" />
        <Skeleton variant="subtitle" className="w-64 mt-1" />
        <div className="flex flex-wrap gap-4">
          <Skeleton variant="text" className="flex-1 h-12" />
          <Skeleton variant="button" className="w-32 h-12" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-[120px]">
              <div className="flex items-start justify-between">
                <div>
                  <Skeleton variant="title" className="w-24" />
                  <Skeleton variant="text" className="w-32 mt-1" />
                  <Skeleton variant="text" className="w-20 mt-1" />
                </div>
                <Skeleton variant="avatar" className="w-8 h-8" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-danger-500" />
        <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
        <Button variant="primary" onClick={loadWords} icon={RefreshCw}>
          {getLocalized({ fa: "تلاش مجدد", en: "Retry" })}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-500" />
              {getLocalized({ fa: "📚 دیکشنری", en: "📚 Dictionary" })}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              {getLocalized({
                fa: `${totalWords} لغت برای یادگیری`,
                en: `${totalWords} words to learn`,
              })}
            </p>
          </div>
          <Badge variant="success" size="sm">
            {savedWords.length} {getLocalized({ fa: "ذخیره شده", en: "Saved" })}
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-4 mb-6"
      >
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={getLocalized({
              fa: "جستجوی لغت...",
              en: "Search words...",
            })}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
        >
          <option value="all">
            {getLocalized({ fa: "همه دسته‌ها", en: "All Categories" })}
          </option>
          {categories.map(
            (cat) =>
              cat !== "all" && (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ),
          )}
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {filteredWords.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <Search className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">
              {getLocalized({
                fa: "هیچ لغتی با این جستجو پیدا نشد",
                en: "No words found",
              })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word) => {
              const saved = isWordSaved(word.id);
              return (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card
                    variant="bordered"
                    padding="md"
                    hover
                    className="hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            {word.de}
                          </h3>
                          <button
                            onClick={() => speakWord(word.de)}
                            className="p-1 rounded-full hover:bg-neutral-100 transition"
                          >
                            <Volume2 className="w-4 h-4 text-neutral-500" />
                          </button>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {word.fa || word.en || ""}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" size="xs">
                            {word.level || "A1"}
                          </Badge>
                          {word.category && (
                            <Badge variant="primary" size="xs">
                              {word.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSaveWord(word)}
                        className={`p-2 rounded-lg hover:bg-neutral-100 transition flex-shrink-0 ${saved ? "text-amber-500" : "text-neutral-400"}`}
                      >
                        {saved ? (
                          <BookmarkCheck className="w-5 h-5" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DictionaryPage;
