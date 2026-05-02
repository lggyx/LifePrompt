/**
 * useToastStore - Global toast notification system
 */

import { create } from 'zustand';

let toastIdCounter = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3000) => {
    const id = ++toastIdCounter;
    const toast = { id, message, type, duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message, duration) => get().addToast(message, 'success', duration),
  error: (message, duration) => get().addToast(message, 'error', duration),
  warning: (message, duration) => get().addToast(message, 'warning', duration),
  info: (message, duration) => get().addToast(message, 'info', duration),
}));

export default useToastStore;
