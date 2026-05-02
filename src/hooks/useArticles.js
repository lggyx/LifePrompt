/**
 * useArticles Hook
 * React hook for article CRUD operations with automatic revalidation
 */

import { useEffect, useCallback } from 'react';
import useArticleStore from '../stores/useArticleStore';

export function useArticles(options = {}) {
  const {
    articles,
    tags,
    isLoading,
    error,
    loadArticles,
    loadTags,
    createArticle,
    updateArticle,
    deleteArticle,
    searchArticles,
    filterByTag,
    filterBySourceType,
    getArticleById,
    getStats,
    resetError,
  } = useArticleStore();

  useEffect(() => {
    loadArticles(options);
    loadTags();
  }, [loadArticles, loadTags]);

  const refresh = useCallback(() => {
    loadArticles(options);
    loadTags();
  }, [loadArticles, loadTags, options]);

  return {
    articles,
    tags,
    isLoading,
    error,
    loadArticles,
    loadTags,
    refresh,
    createArticle,
    updateArticle,
    deleteArticle,
    searchArticles,
    filterByTag,
    filterBySourceType,
    getArticleById,
    getStats,
    resetError,
  };
}

export function useArticle(id) {
  const { getArticleById, updateArticle, deleteArticle, isLoading, error } = useArticleStore();

  const article = getArticleById(id);

  return {
    article,
    isLoading,
    error,
    update: (data) => updateArticle(id, data),
    remove: () => deleteArticle(id),
  };
}
