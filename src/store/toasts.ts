import { create } from 'zustand';
import type { ToastMessage } from '@/types';
import { uid } from '@/utils/id';

interface ToastState {
  toasts: ToastMessage[];
  push: (toast: Omit<ToastMessage, 'id'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = uid('toast');
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...toast, id }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/** Imperative toast helper so non-React modules (api, webhooks) can notify. */
export const toast = {
  success: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, tone: 'success' }),
  info: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, tone: 'default' }),
  warn: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, tone: 'warn' }),
  error: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, tone: 'error' }),
  live: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, tone: 'live' }),
};
