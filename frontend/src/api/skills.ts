import { apiClient } from './client';
import type { Skill, SkillWithMetrics, SkillDetail, CreateSkillData, UpdateSkillData } from '../types/api';

export const skillsApi = {
  list: (activeOnly = true) =>
    apiClient.get<SkillWithMetrics[]>('/skills/', { params: { active_only: activeOnly } }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<SkillDetail>(`/skills/${id}`).then((r) => r.data),

  create: (data: CreateSkillData) =>
    apiClient.post<Skill>('/skills/', data).then((r) => r.data),

  update: (id: string, data: UpdateSkillData) =>
    apiClient.put<Skill>(`/skills/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/skills/${id}`),

  reactivate: (id: string) =>
    apiClient.post<Skill>(`/skills/${id}/reactivate`).then((r) => r.data),
};
