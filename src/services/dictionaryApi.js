/**
 * dictionaryApi.js
 * Path: src/services/dictionaryApi.js
 * Description: Dictionary API service
 */

import api from "./api";

const dictionaryApi = {
  getWords: async (params = {}) => {
    return api.get("/dictionary", { params });
  },

  search: async (query, filters = {}) => {
    return api.get("/dictionary/search", {
      params: { q: query, ...filters },
    });
  },

  getWord: async (wordId) => {
    return api.get(`/dictionary/word/${wordId}`);
  },

  saveWord: async (wordId) => {
    return api.post("/dictionary/saved-words", { wordId });
  },

  removeWord: async (wordId) => {
    return api.delete(`/dictionary/saved-words/${wordId}`);
  },

  getSavedWords: async () => {
    return api.get("/dictionary/saved-words");
  },

  getCategories: async () => {
    return api.get("/dictionary/categories");
  },
};

export default dictionaryApi;
