/**
 * AI Store - Zustand
 * Manages AI model configs, active model, chat messages
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { aiConfigRepo, chatHistoryRepo } from '../services/storage/db';
import { STORAGE_KEYS } from '../utils/constants';

const useAIStore = create(
  persist(
    (set, get) => ({
      configs: [],
      messages: [],
      isLoading: false,
      error: null,

      // Configs
      loadConfigs: () => {
        const configs = aiConfigRepo.getAll();
        set({ configs });
        return configs;
      },

      addConfig: (data) => {
        const id = aiConfigRepo.create(data);
        get().loadConfigs();
        return id;
      },

      updateConfig: (id, data) => {
        aiConfigRepo.update(Number(id), data);
        // Optimise: patch store in-memory instead of re-reading entire table
        set((state) => ({
          configs: state.configs.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      deleteConfig: (id) => {
        aiConfigRepo.delete(Number(id));
        get().loadConfigs();
      },

      setActiveConfig: (id) => {
        aiConfigRepo.setActive(Number(id));
        get().loadConfigs();
      },

      getActiveConfig: () => {
        return aiConfigRepo.getActive();
      },

      // Messages
      loadMessages: () => {
        const messages = chatHistoryRepo.getAll(200);
        // Reverse to chronological order
        set({ messages: messages.reverse() });
      },

      addMessage: (msg) => {
        chatHistoryRepo.create(msg);
        set((state) => ({ messages: [...state.messages, msg] }));
      },

      clearMessages: () => {
        chatHistoryRepo.clear();
        set({ messages: [] });
      },

      setLoading: (v) => set({ isLoading: v }),
      setError: (err) => set({ error: err }),
      resetError: () => set({ error: null }),
    }),
    {
      name: STORAGE_KEYS.AI_CONFIGS,
      partialize: (state) => ({}), // Configs persisted in SQLite, not localStorage
    }
  )
);

export default useAIStore;
