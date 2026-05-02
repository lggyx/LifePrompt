/**
 * Settings Store - Zustand
 * Manages app settings with persistence via SQLite + localStorage fallback
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settingsRepo } from '../services/storage/db';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';

const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: { ...DEFAULT_SETTINGS },
      isLoading: false,

      loadSettings: () => {
        try {
          const all = settingsRepo.getAll();
          set({ settings: { ...DEFAULT_SETTINGS, ...all } });
        } catch (err) {
          console.warn('[SettingsStore] load from SQLite failed:', err);
        }
      },

      setSetting: (key, value) => {
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        }));
        try {
          settingsRepo.set(key, value);
        } catch (err) {
          console.warn('[SettingsStore] save to SQLite failed:', err);
        }
      },

      setSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
        try {
          Object.entries(partial).forEach(([k, v]) => {
            settingsRepo.set(k, v);
          });
        } catch (err) {
          console.warn('[SettingsStore] batch save failed:', err);
        }
      },

      resetSettings: () => {
        set({ settings: { ...DEFAULT_SETTINGS } });
        try {
          Object.keys(DEFAULT_SETTINGS).forEach((k) => {
            settingsRepo.set(k, DEFAULT_SETTINGS[k]);
          });
        } catch (err) {
          console.warn('[SettingsStore] reset failed:', err);
        }
      },
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

export default useSettingsStore;
