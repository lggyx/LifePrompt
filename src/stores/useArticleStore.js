/**
 * Article Store - Zustand
 * Manages articles, tags, search/filter state with SQLite persistence
 */

import { create } from 'zustand';
import { articleRepo, tagRepo } from '../services/storage/db';

const useArticleStore = create((set, get) => ({
  articles: [],
  tags: [],
  isLoading: false,
  error: null,

  // Actions
  loadArticles: async (options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = articleRepo.getAll(options);
      set({ articles: data, isLoading: false });
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  loadTags: async () => {
    try {
      const data = tagRepo.getAll();
      set({ tags: data });
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  getArticleById: (id) => {
    return articleRepo.getById(Number(id));
  },

  createArticle: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const id = articleRepo.create(data);
      await get().loadArticles();
      await get().loadTags();
      set({ isLoading: false });
      return id;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateArticle: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      articleRepo.update(Number(id), data);
      await get().loadArticles();
      await get().loadTags();
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteArticle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      articleRepo.delete(Number(id));
      await get().loadArticles();
      await get().loadTags();
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  searchArticles: (query) => {
    if (!query.trim()) {
      get().loadArticles();
      return;
    }
    const results = articleRepo.search(query.trim());
    set({ articles: results });
  },

  filterByTag: (tagName) => {
    if (!tagName) {
      get().loadArticles();
      return;
    }
    const results = articleRepo.getByTag(tagName);
    set({ articles: results });
  },

  filterBySourceType: (sourceType) => {
    if (!sourceType) {
      get().loadArticles();
      return;
    }
    const results = articleRepo.getBySourceType(sourceType);
    set({ articles: results });
  },

  getStats: () => {
    return articleRepo.getStats();
  },

  resetError: () => set({ error: null }),
}));

export default useArticleStore;
