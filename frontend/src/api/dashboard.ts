import { apiClient } from './client';
import type { DashboardSummary, HeatmapData, AnalyticsData } from '../types/api';

export const dashboardApi = {
  getSummary: () =>
    apiClient.get<DashboardSummary>('/dashboard/summary').then((r) => r.data),

  getHeatmap: (year?: number) =>
    apiClient.get<HeatmapData>('/dashboard/heatmap', { params: year ? { year } : {} }).then((r) => r.data),

  getAnalytics: () =>
    apiClient.get<AnalyticsData>('/dashboard/analytics').then((r) => r.data),
};
