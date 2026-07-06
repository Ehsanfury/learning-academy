import { useState, useCallback } from "react";
import dictionaryApi from "@services/dictionaryApi";
import toast from "react-hot-toast";

function useDictionary() {
  const [searchResults, setSearchResults] = useState([]);
  const [savedWords, setSavedWords] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const results = await dictionaryApi.search(query);
      setSearchResults(results);
    } catch (error) {
      toast.error("خطا در جستجوی کلمه");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const saveWord = useCallback(async (wordId) => {
    try {
      await dictionaryApi.saveWord(wordId);
      toast.success("کلمه ذخیره شد");
      return true;
    } catch (error) {
      toast.error("خطا در ذخیره کلمه");
      return false;
    }
  }, []);

  const removeWord = useCallback(async (wordId) => {
    try {
      await dictionaryApi.removeWord(wordId);
      setSavedWords((prev) => prev.filter((w) => w.id !== wordId));
      toast.success("کلمه حذف شد");
    } catch (error) {
      toast.error("خطا در حذف کلمه");
    }
  }, []);

  const fetchSavedWords = useCallback(async () => {
    try {
      const words = await dictionaryApi.getSavedWords();
      setSavedWords(words);
    } catch (error) {
      toast.error("خطا در دریافت کلمات ذخیره شده");
    }
  }, []);

  return {
    searchResults,
    savedWords,
    isSearching,
    searchQuery,
    search,
    saveWord,
    removeWord,
    fetchSavedWords,
  };
}

export default useDictionary;
