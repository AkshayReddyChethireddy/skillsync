import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  isAddSkillOpen: boolean;
  isEditSkillOpen: boolean;
  editingSkillId: string | null;
  isLogSessionOpen: boolean;
  logSessionSkillId: string | null;
  toasts: Toast[];

  openAddSkill: () => void;
  closeAddSkill: () => void;
  openEditSkill: (skillId: string) => void;
  closeEditSkill: () => void;
  openLogSession: (skillId?: string) => void;
  closeLogSession: () => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddSkillOpen: false,
  isEditSkillOpen: false,
  editingSkillId: null,
  isLogSessionOpen: false,
  logSessionSkillId: null,
  toasts: [],

  openAddSkill: () => set({ isAddSkillOpen: true }),
  closeAddSkill: () => set({ isAddSkillOpen: false }),
  openEditSkill: (skillId) => set({ isEditSkillOpen: true, editingSkillId: skillId }),
  closeEditSkill: () => set({ isEditSkillOpen: false, editingSkillId: null }),
  openLogSession: (skillId) => set({ isLogSessionOpen: true, logSessionSkillId: skillId ?? null }),
  closeLogSession: () => set({ isLogSessionOpen: false, logSessionSkillId: null }),

  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
