import { create } from 'zustand';
import type { NotificationItem } from '@/types';
import { uid } from '@/utils/id';

interface NotificationState {
  items: NotificationItem[];
  drawerOpen: boolean;
  push: (item: Omit<NotificationItem, 'id' | 'atISO' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useNotifications = create<NotificationState>((set) => ({
  items: [],
  drawerOpen: false,
  push: (item) =>
    set((s) => ({
      items: [{ ...item, id: uid('note'), atISO: new Date().toISOString(), read: false }, ...s.items].slice(0, 40),
    })),
  markRead: (id) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)) })),
  markAllRead: () => set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) })),
  clear: () => set({ items: [] }),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
}));

export function unreadCount(items: NotificationItem[]): number {
  return items.filter((i) => !i.read).length;
}
