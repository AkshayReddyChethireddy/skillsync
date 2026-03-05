import { create } from 'zustand';
import { progressApi, type ProgressFilters } from '../api/progress';
import type { ProgressLog, LogSessionData } from '../types/api';

interface ProgressState {
  logs: ProgressLog[];
  total: number;
  isSubmitting: boolean;
  isLoading: boolean;
  filters: ProgressFilters;

  fetchLogs: (filters?: ProgressFilters) => Promise<void>;
  logSession: (data: LogSessionData) => Promise<void>;
  updateLog: (logId: string, data: Partial<LogSessionData>) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  setFilters: (filters: ProgressFilters) => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  logs: [],
  total: 0,
  isSubmitting: false,
  isLoading: false,
  filters: {},

  fetchLogs: async (filters) => {
    set({ isLoading: true });
    try {
      const f = filters ?? get().filters;
      const result = await progressApi.list(f);
      set({ logs: result.logs, total: result.total, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  logSession: async (data) => {
    set({ isSubmitting: true });
    try {
      const log = await progressApi.log(data);
      set((state) => ({
        logs: [log, ...state.logs],
        total: state.total + 1,
        isSubmitting: false,
      }));
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  updateLog: async (logId, data) => {
    const updated = await progressApi.update(logId, data);
    set((state) => ({
      logs: state.logs.map((l) => (l.id === logId ? updated : l)),
    }));
  },

  deleteLog: async (logId) => {
    await progressApi.delete(logId);
    set((state) => ({
      logs: state.logs.filter((l) => l.id !== logId),
      total: state.total - 1,
    }));
  },

  setFilters: (filters) => set({ filters }),
}));
