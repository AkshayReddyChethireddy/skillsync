import { apiClient } from './client';
import type { SkillMetricsDetail, LeaderboardEntry } from '../types/api';

export const metricsApi = {
  getSkillMetrics: (skillId: string) =>
    apiClient.get<SkillMetricsDetail>(`/metrics/skill/${skillId}`).then((r) => r.data),

  recompute: (skillId: string) =>
    apiClient.post(`/metrics/skill/${skillId}/recompute`).then((r) => r.data),

  getLeaderboard: () =>
    apiClient.get<LeaderboardEntry[]>('/metrics/leaderboard').then((r) => r.data),
};
