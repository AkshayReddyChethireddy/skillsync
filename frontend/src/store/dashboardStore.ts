import { create } from 'zustand';
import { dashboardApi } from '../api/dashboard';
import type { DashboardSummary, HeatmapData, AnalyticsData } from '../types/api';

interface DashboardState {
  summary: DashboardSummary | null;
  heatmapData: HeatmapData | null;
  analytics: AnalyticsData | null;
  selectedYear: number;
  isLoading: boolean;
  lastFetched: Date | null;

  fetchSummary: () => Promise<void>;
  fetchHeatmap: (year?: number) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchAll: () => Promise<void>;
  setSelectedYear: (year: number) => void;
  invalidate: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  heatmapData: null,
  analytics: null,
  selectedYear: new Date().getFullYear(),
  isLoading: false,
  lastFetched: null,

  fetchSummary: async () => {
    const summary = await dashboardApi.getSummary();
    set({ summary });
  },

  fetchHeatmap: async (year) => {
    const y = year ?? get().selectedYear;
    const heatmapData = await dashboardApi.getHeatmap(y);
    set({ heatmapData });
  },

  fetchAnalytics: async () => {
    const analytics = await dashboardApi.getAnalytics();
    set({ analytics });
  },

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const [summary, heatmapData, analytics] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getHeatmap(get().selectedYear),
        dashboardApi.getAnalytics(),
      ]);
      set({ summary, heatmapData, analytics, isLoading: false, lastFetched: new Date() });
    } catch {
      set({ isLoading: false });
    }
  },

  setSelectedYear: (year) => {
    set({ selectedYear: year });
    get().fetchHeatmap(year);
  },

  invalidate: () => set({ lastFetched: null }),
}));
