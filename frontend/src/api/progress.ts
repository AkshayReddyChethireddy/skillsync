import { apiClient } from './client';
import type { ProgressLog, ProgressLogList, LogSessionData } from '../types/api';

export interface ProgressFilters {
  skill_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export const progressApi = {
  log: (data: LogSessionData) =>
    apiClient.post<ProgressLog>('/progress/', data).then((r) => r.data),

  list: (filters?: ProgressFilters) =>
    apiClient.get<ProgressLogList>('/progress/', { params: filters }).then((r) => r.data),

  listForSkill: (skillId: string, limit = 50) =>
    apiClient.get<ProgressLogList>(`/progress/skill/${skillId}`, { params: { limit } }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<ProgressLog>(`/progress/${id}`).then((r) => r.data),

  update: (id: string, data: Partial<LogSessionData>) =>
    apiClient.put<ProgressLog>(`/progress/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/progress/${id}`),
};
