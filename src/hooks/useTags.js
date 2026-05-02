/**
 * useTags Hook
 * React hook for tag management
 */

import { useEffect } from 'react';
import useArticleStore from '../stores/useArticleStore';

export function useTags() {
  const { tags, loadTags } = useArticleStore();

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return { tags, refresh: loadTags };
}
