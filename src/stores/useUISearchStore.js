/**
 * UI Search Store - Zustand
 * Manages UI-level search, filter, and view state (non-persistent)
 */

import { create } from 'zustand';
import { VIEW_MODES } from '../utils/constants';

const useUISearchStore = create((set, get) => ({
  // Search
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  clearSearch: () => set({ searchQuery: '' }),

  // Filters
  selectedTags: [],
  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),
  clearTags: () => set({ selectedTags: [] }),

  selectedSources: [],
  toggleSource: (source) =>
    set((state) => ({
      selectedSources: state.selectedSources.includes(source)
        ? state.selectedSources.filter((s) => s !== source)
        : [...state.selectedSources, source],
    })),
  clearSources: () => set({ selectedSources: [] }),

  timeRange: 0,
  setTimeRange: (days) => set({ timeRange: days }),

  // View mode
  viewMode: VIEW_MODES.STANDARD,
  setViewMode: (mode) => set({ viewMode: mode }),

  // UI state
  showFilters: false,
  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

  resetAll: () =>
    set({
      searchQuery: '',
      selectedTags: [],
      selectedSources: [],
      timeRange: 0,
      showFilters: false,
    }),
}));

export default useUISearchStore;
