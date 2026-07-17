import { create } from 'zustand';
import { AppNotification } from '../types';

export interface NotificationsState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  updateLifecycleState: (id: string, lifecycleState: AppNotification['lifecycleState']) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => {
      const newNotification: AppNotification = {
        ...notification,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString(),
        read: false,
        lifecycleState: notification.lifecycleState || 'delivered',
      };
      return { notifications: [newNotification, ...state.notifications] };
    }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true, lifecycleState: 'read' as const } : n
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true, lifecycleState: 'read' as const })),
    })),
  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  updateLifecycleState: (id, lifecycleState) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, lifecycleState } : n
      ),
    })),
}));
