import { create } from 'zustand';
import { ActiveBook } from '../types';

export interface ActiveBookState {
  activeBook: ActiveBook | null;
  setActiveBook: (book: ActiveBook | null) => void;
  updateProgress: (page: number) => void;
  targetDirectChat: { id: string; recipientId: string; recipientName: string } | null;
  setTargetDirectChat: (chat: { id: string; recipientId: string; recipientName: string } | null) => void;
}

export const useActiveBookStore = create<ActiveBookState>((set) => ({
  activeBook: null,
  setActiveBook: (activeBook) => set({ activeBook }),
  updateProgress: (page) =>
    set((state) => {
      if (!state.activeBook) return {};
      const totalPages = state.activeBook.totalPages;
      const progressPercentage = Math.round((page / totalPages) * 100);
      return {
        activeBook: {
          ...state.activeBook,
          currentPage: page,
          progressPercentage,
        },
      };
    }),
  targetDirectChat: null,
  setTargetDirectChat: (chat) => set({ targetDirectChat: chat }),
}));
