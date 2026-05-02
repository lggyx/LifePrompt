/**
 * Theme Store - Zustand
 * Manages light/night theme with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';

const THEME_VALUES = {
  LIGHT: 'light',
  NIGHT: 'night',
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: THEME_VALUES.LIGHT,

      setTheme: (theme) => {
        set({ theme });
        // Immediately apply to document for CSS transitions
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === THEME_VALUES.LIGHT ? THEME_VALUES.NIGHT : THEME_VALUES.LIGHT;
        get().setTheme(newTheme);
      },

      initTheme: () => {
        // Apply stored theme on app mount
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', get().theme);
        }
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;
export { THEME_VALUES };
