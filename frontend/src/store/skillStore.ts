import { create } from 'zustand';
import { skillsApi } from '../api/skills';
import type { SkillWithMetrics, SkillDetail, CreateSkillData, UpdateSkillData } from '../types/api';

interface SkillState {
  skills: SkillWithMetrics[];
  selectedSkill: SkillDetail | null;
  isLoading: boolean;
  error: string | null;

  fetchSkills: () => Promise<void>;
  fetchSkillDetail: (skillId: string) => Promise<void>;
  createSkill: (data: CreateSkillData) => Promise<void>;
  updateSkill: (skillId: string, data: UpdateSkillData) => Promise<void>;
  deleteSkill: (skillId: string) => Promise<void>;
  reactivateSkill: (skillId: string) => Promise<void>;
  clearSelected: () => void;

  getActiveSkills: () => SkillWithMetrics[];
  getStagnantSkills: () => SkillWithMetrics[];
  getTopSkillByMomentum: () => SkillWithMetrics | null;
}

export const useSkillStore = create<SkillState>((set, get) => ({
  skills: [],
  selectedSkill: null,
  isLoading: false,
  error: null,

  fetchSkills: async () => {
    set({ isLoading: true, error: null });
    try {
      const skills = await skillsApi.list();
      set({ skills, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Failed to load skills' });
    }
  },

  fetchSkillDetail: async (skillId) => {
    set({ isLoading: true });
    try {
      const skill = await skillsApi.get(skillId);
      set({ selectedSkill: skill, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Failed to load skill details' });
    }
  },

  createSkill: async (data) => {
    await skillsApi.create(data);
    await get().fetchSkills();
  },

  updateSkill: async (skillId, data) => {
    await skillsApi.update(skillId, data);
    await get().fetchSkills();
    if (get().selectedSkill?.id === skillId) {
      await get().fetchSkillDetail(skillId);
    }
  },

  deleteSkill: async (skillId) => {
    await skillsApi.delete(skillId);
    set((state) => ({ skills: state.skills.filter((s) => s.id !== skillId) }));
  },

  reactivateSkill: async (skillId) => {
    await skillsApi.reactivate(skillId);
    await get().fetchSkills();
  },

  clearSelected: () => set({ selectedSkill: null }),

  getActiveSkills: () => get().skills.filter((s) => s.is_active),
  getStagnantSkills: () => get().skills.filter((s) => s.metrics?.is_stagnant),
  getTopSkillByMomentum: () => {
    const active = get().getActiveSkills();
    if (!active.length) return null;
    return active.reduce((top, s) =>
      (s.metrics?.momentum_score ?? 0) > (top.metrics?.momentum_score ?? 0) ? s : top
    );
  },
}));
